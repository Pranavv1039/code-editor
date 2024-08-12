import React, { useState, useRef, useEffect } from "react";
import logo from "../logo.svg";
import Client from "../components/Client";
import Editor from "../components/Editor";
import { initSocket } from "../socket";
import ACTIONS from "../Actions";
import { useLocation, useNavigate, useParams, Navigate } from 'react-router-dom';
import toast from "react-hot-toast";
import { v4 as uuidv4 } from 'uuid';

const EditorPage = () => {
  const socketRef = useRef(null);
  const location = useLocation();
  const { roomId } = useParams();
  const reactNavigate = useNavigate();
  const [code, setCode] = useState('// type your code here...');
  const [clients, setClients] = useState([]);

  const emitCodeChangeRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      if (!socketRef.current) {
        socketRef.current = await initSocket();

        const handleErrors = (e) => {
          console.log('Socket error:', e);
          toast.error('Socket connection failed, try again later');
          reactNavigate('/');
        };
        socketRef.current.on('connect_error', handleErrors);
        socketRef.current.on('connect_failed', handleErrors);

        const id = uuidv4();
        socketRef.current.emit(ACTIONS.JOIN, {
          roomId,
          id,
          username: location.state?.username
        });

        socketRef.current.on(ACTIONS.JOINED, ({ clients, username, socketId }) => {
          if (username !== location.state?.username) {
            toast.success(`${username} has joined the room`);
            socketRef.current.emit(ACTIONS.SYNC_CODE,{
              code,
              roomId,
            })
          }
          setClients(clients);
          console.log(clients);
        });

        socketRef.current.on(ACTIONS.DISCONNECTED, ({ username, socketId }) => {
          toast.success(`${username} has left the room`);
          setClients((prev) => {
            return prev.filter(client => client.socketId !== socketId);
          });
        });

        socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
          setCode(code);
        });

        // Set up the emit function
        emitCodeChangeRef.current = (value) => {
          socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            roomId,
            code: value,
          });
          console.log('Emitted CODE_CHANGE:', { roomId, code: value });

        };
      }
    };

    init();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current.off(ACTIONS.JOINED);
        socketRef.current.off(ACTIONS.DISCONNECTED);
        socketRef.current.off(ACTIONS.CODE_CHANGE);
      }
    };
  }, [ location.state?.username, reactNavigate, roomId]);

  const handleCodeChange = (value) => {
    setCode(value);
    if (emitCodeChangeRef.current) {
      emitCodeChangeRef.current(value); 
    }
  };
  const copyRoomID=async()=>{
    try {
      await navigator.clipboard.writeText(roomId)
      toast.success('copied to clipboard')
    } catch (error) {
      toast.error('Unable to copy roomID')
    }
  }
  const leaveRoom=()=>{
    reactNavigate('/')
  }
  if (!location.state) {
    return <Navigate to={'/'} />;
  }

  return (
    <div className="mainWrap">
      <div className="aside">
        <div className="asideInner">
          <div className="logo">
            <img src={logo} alt="logo/icon" className="logoImage" style={{ width: "100px" }} />
          </div>
          <h3>Connected</h3>
          <div className="clientsList">
            {clients.map((client) => {
              return <Client key={client.socketId} username={client.username} />
            })}
          </div>
        </div>
        <button className="btn copyBtn" onClick={copyRoomID} >Copy ROOM ID</button>
        <button className="btn leaveBtn" onClick={leaveRoom} >Leave</button>
      </div>
      <Editor language="javascript"
        value={code}
        onChange={handleCodeChange} />
    </div>
  );
};

export default EditorPage;
