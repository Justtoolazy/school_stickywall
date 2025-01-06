
import './App.css'
import { useState, useEffect } from 'react';
import sample from './sample.json';


import { initializeApp} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {onSnapshot, addDoc, getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAa4KBU1euB6QiDFeQPFHUb8vGNdtnpkmI",
  authDomain: "rockbookscissor.firebaseapp.com",
  projectId: "rockbookscissor",
  storageBucket: "rockbookscissor.firebasestorage.app",
  messagingSenderId: "387165792720",
  appId: "1:387165792720:web:0ace9e5b8b1c22ebe971d5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


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
      ctx.font = '16px Comic Sans MS';
      ctx.fillText(this.title, this.x + 10, this.y + 30);

      //wrap text
      ctx.fillStyle = 'black';
      ctx.font = '12px Comic Sans MS';
      const words = (this.content || '').split(' ');
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
      ctx.font = '10px Comic Sans MS';
      ctx.fillText("- " + this.nickname, this.x + this.width/2 + 10, y + 40);
    }
  }

  notesArray.forEach(note => {
    const sticky = new stickyNote(
      note.id,
      note.account,
      note.x,
      note.y,
      note.width,
      note.height,
      note.title,
      note.content,
      note.nickname,
      note.noteColor
    );
    sticky.drawNote();
  });
}


function App() {
  const [notes, setNotes] = useState([]);
  useEffect(() => {
    async function fetchNotes() {
      try {
        const querySnapshot = await getDocs(collection(db, "StickyNotes"));
        const notesData = querySnapshot.docs.map(doc => doc.data());
        setNotes(notesData);
      } catch (error) {
        console.error("Error fetching notes:", error); // Log the error here
      }
    }
  
    fetchNotes();
  }, []);
  
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

  //state of the Edit Window
  const [isEdit, setIsEdit] = useState(false);

  //handles mouse position when clicked
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const handleMouseClick = (event) => {
      handlePosition(event.clientX, event.clientY);
  };
  const handleTouchStart = (event) => {
      const touch = event.touches[0];
      handlePosition(touch.clientX, touch.clientY);
  };
  const handlePosition = (clientX, clientY) => {
    const canvas = document.getElementById('stickWall');
    const editPost = document.getElementById('editPoststop');
    setIsEdit(prevEdit => {
      let handlePrevedit = prevEdit;
      if (editPost) {
        const rect = editPost.getBoundingClientRect();
        if (
          clientX < rect.left ||
          clientX > rect.right ||
          clientY < rect.top ||
          clientY > rect.bottom
        ){
          handlePrevedit = true;
        } else {
          handlePrevedit = !prevEdit;
        }
      }
    if(isEdit == false && canvas) {
      const canvasRect = canvas.getBoundingClientRect();
      setMousePosition({
        x: clientX - canvasRect.left,
        y: clientY - canvasRect.top
      });
    }
    return !handlePrevedit;
  });
  };
useEffect(() => {
  document.addEventListener('click', handleMouseClick);
  document.addEventListener('touchstart', handleTouchStart);
  return () => {
    document.removeEventListener('click', handleMouseClick);
    document.removeEventListener('touchstart', handleTouchStart);
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
  const saveNoteInputs = () => {
    const turntofalse = false;
    setIsEdit(turntofalse);
    const generatePastelColor = () => {
      const r = Math.floor((Math.random() * 127) + 127);
      const g = Math.floor((Math.random() * 127) + 127);
      const b = Math.floor((Math.random() * 127) + 127);
      return `rgb(${r}, ${g}, ${b})`;
    };
    const newNote = {
      ...note,
      id: Date.now().toString(),
      account: 'guest',
      width: 220,
      height: 150,
      x: mousePosition.x,
      y: mousePosition.y,
      title: countText.Title,
      content: countText.Content,
      nickname: countText.NickName,
      noteColor: generatePastelColor()
    };
    if(newNote.title.length > 0 && newNote.content.length > 0 && newNote.nickname.length > 0){
      setNotes(prevNotes => [{
      newNote}, ...prevNotes]);
    const saveNoteToFirebase = async (newNote) => {
      try {
        await addDoc(collection(db, "StickyNotes"), newNote);
      } catch (error) {
        console.error("Error adding note to Firebase:", error);
      }
    };
    saveNoteToFirebase(newNote);
    }
    setNote({
      id: '',
      account: '',
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      title: '',
      content: '',
      nickname: '',
      noteColor: ""
    });
    setMousePosition({x: 0, y: 0})
    setCountText({Title: '', Content: '', NickName: ''});
    
  }
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "StickyNotes"), (snapshot) => {
      const notesData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setNotes(notesData); // Updates the notes state in real-time
    });
  
    return () => unsubscribe(); // Clean up the listener when the component unmounts
  }, []);
  //to draw the inputs
  useEffect(() => {
    canvasApp(mousePosition, notes);
  }, [mousePosition, notes]);

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
        <button onClick={saveNoteInputs}>Save</button>
      </div>}
    </div>
  )
}
export default App



