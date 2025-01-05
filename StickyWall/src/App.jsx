
import './App.css'
import { useState, useEffect } from 'react';

function canvasApp(mousePosition, notes) {
  const canvas = document.getElementById('stickWall');
  const ctx = canvas.getContext('2d');
  const notesArray = notes;
  let canvasSize = 1000 + ((notesArray.length/33) * 1500);
  canvas.width = canvasSize;
  canvas.height = canvasSize;

  let dragIndex = null;
  let offsetX = 0;
  let offsetY = 0;

  function drawGrid(ctx, canvasSize, gap){
    ctx.strokeStyle = 'red';  
    let highlighGrid = 0;
    for(let xy = gap; xy < canvasSize; xy += gap){
      ctx.beginPath();
      if(highlighGrid == 4){
        ctx.lineWidth = 0.5;
        highlighGrid = 0;
      } else {
        ctx.lineWidth = 0.3;
        highlighGrid++;
      }
      ctx.moveTo(xy, 0);
      ctx.lineTo(xy, canvasSize);
      ctx.moveTo(0, xy);
      ctx.lineTo(canvasSize, xy);
      ctx.stroke();
    }
  }
  drawGrid(ctx, canvasSize, 20);

  class stickyNote {
    constructor(id, account, x, y, width, height, title, content, nickname, noteColor){
      this.id = id;
      this.account = account;
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.title = title;
      this.content = content;
      this.nickname = nickname;
      this.noteColor = noteColor;
    }
    drawNote(){
      ctx.fillStyle = this.noteColor;
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.fillStyle = 'black';
      ctx.font = '16px Arial';
      ctx.fillText(this.title, this.x + 10, this.y + 30);

      //wrap text
      ctx.fillStyle = 'black';
      ctx.font = '12px Arial';
      const words = this.content.split(' ');
      let line = '';
      const lignHeight = 20;
      let y = this.y + 30;
      for(let n = 0; n < words.length; n++){
        let testLine = line + words[n] + ' ';
        let testWidth = ctx.measureText(testLine).width;
        if(testWidth > this.width - 20){
          ctx.fillText(line, this.x + 10, y+20);
          line = words[n] + ' ';
          y += lignHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, this.x + 10, y+20); // Draw the last line
      
      
      ctx.font = '10px Arial';
      ctx.fillText("- " + this.nickname, this.x + this.width/2 + 10, y + 40);
    
    }
  }
  stickyNote = new stickyNote(1234, 'account', mousePosition.x, mousePosition.y, 220, 150, 'Title', ' belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000.', 'Nickname', '#ffffff');
  stickyNote.drawNote();
}


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
  
  //handles input change
  const [countText, setCountText] = useState({Title: '', Content: '', NickName: ''});
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setCountText(prevCountText => {
      if(name === 'title' && value.length <= 16) {
        return {...prevCountText, Title: value}
      }
      if(name === 'content' && value.length <= 160) {
        return {...prevCountText, Content: value}
      }
      if(name === 'nickName' && value.length <= 16) {
        return {...prevCountText, NickName: value}
      }
      return prevCountText;
    });
  };
  useEffect(() => {
    canvasApp(mousePosition, notes);
  }, [mousePosition, notes]);
  const saveNoteInputs = () => {
    setNote({
      ...note,
      title: countText.Title,
      content: countText.Content,
      nickname: countText.NickName
    });
    setCountText({Title: '', Content: '', NickName: ''});
  }
  
  return (
    <div className="App">
    <canvas id='stickWall'></canvas>
    {isEdit && <div className='editPost' id='editPoststop'>
        <h1>Edit Sticky Note</h1>

        <label htmlFor='title'>Title: {countText.Title.length}/16</label>
        <input 
          type='text' 
          id='title' 
          name='title'
          maxLength={16}
          value={countText.Title}
          onChange={handleInputChange}  
        />

        <label htmlFor='content'>Content: {countText.Content.length}/160</label>
        <textarea 
          id='content' 
          name='content' 
          maxLength={160}
          value={countText.Content}
          onChange={handleInputChange}
        />

        <label htmlFor='nickName'>NickName: {countText.NickName.length}/16</label>
        <input 
          type='text' 
          id='nickName' 
          name='nickName' 
          maxLength={16}
          value={countText.NickName}
          onChange={handleInputChange}
        />
        
        <label htmlFor='color'>Color: </label>
        <input type='color' id='color' name='color'/>

        <button onClick={saveNoteInputs}>Save</button>
      </div>}
    </div>
  )
}
export default App

