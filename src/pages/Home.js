import React, { useState } from 'react'
import logo from '../logo.svg'
import { v4 as uuidv4 } from 'uuid'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
const Home = () => {
  const [roomId, setRoomId] = useState('');
  const [username, setUSERNAME] = useState('');
  const Navigate=useNavigate()
  const createNewRoom = (e) => {
    e.preventDefault();
    const id = uuidv4()
    setRoomId(id)
    toast.success('created a new room')
  }
  const JoinRoom=(e)=>{
    e.preventDefault()
    if(!roomId || !username){ 
      toast.error('room id & username is required');
      return;
    }
    console.log({username,roomId})
    Navigate(`/editor/${roomId}`,{
      state:{
        username
      }
    })
  }
  return (
    <>
      <div className='homePageWrapper'>
        <div className="formWrapper">
          <form action="">
            <img src={logo} className='homePageLogo' alt="icon/logo" style={{ width: '100px' }} />
            <h4 className="mainLabel">Paste Invitation ID</h4>
            <div className="inputGroup">
              <input type="text" className='inputBox' placeholder='ROOM ID' value={roomId} onChange={(e) => setRoomId(e.target.value)} />
              <input type="text" className='inputBox' placeholder='username' value={username}  onChange={(e) => setUSERNAME(e.target.value)} />
              <button className="btn joinBtn" onClick={JoinRoom} >Join</button>
              <span className="createInfo">
                If you don't have an invite then create &nbsp;
                <a onClick={createNewRoom} href="/" className='createNewBtn'>new user</a>
              </span>
            </div>
          </form>
        </div>
        <footer>
          <h4>Built with 💝 by <a href="*">Karunya </a>  </h4>
        </footer>
      </div>
    </>
  )
}

export default Home