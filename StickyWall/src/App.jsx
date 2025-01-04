
import './App.css'
import { useState, useEffect } from 'react';
function App() {
  const [notes, setNotes] = useState([]);
  const [note, setNote] = useState({
    id: '',
    account: '',
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    title: '',
    content: '',
    nickname: '',
    noteColor: '#ffffff'
  });

  const [isEdit, setIsEdit] = useState(false);
  //handles mouse position when clicked
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const handleMouseClick = (event) => {
    setMousePosition({
      x: event.clientX,
      y: event.clientY
    });
    const editPost = document.getElementById('editPoststop');
    setIsEdit(prevEdit => {
      let handlePrevedit = prevEdit;
      if (editPost) {
        const rect = editPost.getBoundingClientRect();
        if (
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom
        ){
         
          handlePrevedit = true;
        } else {
        
          handlePrevedit = !prevEdit;
        }
      }
    return !handlePrevedit;
    });
    
};
  useEffect(() => {
    document.addEventListener('click', handleMouseClick);
    return () => {
      document.removeEventListener('click', handleMouseClick);
    };
  });
  
 

  return (
    <div className="App">
    {isEdit && <div className='editPost' id='editPoststop'>
        <h1>Edit Sticky Note</h1>
        <label htmlFor='title'>Title:</label>
        <input type='text' id='title' name='title' />
        <label htmlFor='content'>Content: </label>
        <textarea id='content' name='content' />
        <label htmlFor='NIckName'>NickName: </label>
        <input type='text' id='nickName' name='nickName' />
        <label htmlFor='color'>Color: </label>
        <input type='color' id='color' name='color' />
        <button>Save</button>
      </div>}
    </div>
  )
}

export default App
