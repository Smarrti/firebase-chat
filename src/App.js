import React, { useState, useRef } from "react";
import "./App.css";
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from 'react-firebase-hooks/firestore';

if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: "AIzaSyByVr2RlfgtvfyhHD2WDqO4vsGvB9bM4-Y",
    authDomain: "firechat-cd3da.firebaseapp.com",
    projectId: "firechat-cd3da",
    storageBucket: "firechat-cd3da.appspot.com",
    messagingSenderId: "247286462747",
    appId: "1:247286462747:web:0cf7d55d2bcef4143b3bbe",
    measurementId: "G-1TWPWDWJNZ",
  });
}

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);
  console.log(user);
  return (
    <div className="App">
      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

const SignIn = () => {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };
  return <button onClick={signInWithGoogle}>Sign in with Google</button>;
};

const SignOut = () => {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()} className="signout">Sign Out</button>
  )
}

const ChatRoom = () => {
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [ messages ] = useCollectionData(query, { idField: 'id' })
  
  const [ formValue, setFormValue ] = useState('');
  const scrollDown = useRef();

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    scrollDown.current.scrollIntoView({ behavior: 'smooth' });
    setFormValue('');
  }

  return (
    <>
      <header>
        <SignOut />
      </header>
      <main>
        {
          messages && messages.map(msg => <ChatMessage key={msg.id} message={msg}/>)
        }
        <div ref={scrollDown}></div>
      </main>
      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} />
        <button type="submit">🕊️</button>
      </form>
    </>
  )
};

const ChatMessage = ({ message }) => {
  const { text, uid, photoURL } = message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return <div className={`message ${messageClass}`}>
    <img src={photoURL} alt="avatar" />
    <p>{text}</p>
  </div>
}

export default App;
