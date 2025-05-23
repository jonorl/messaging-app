 import React from 'react';
 import './App.css';
 

 function ICQLayout() {
  return (
  <div className="icq-container">
  <aside className="contact-list">
  {/* Contact list items will go here */}
  <h3>Contacts</h3>
  <ul>
  <li>Contact 1</li>
  <li>Contact 2</li>
  <li>Contact 3</li>
  </ul>
  </aside>
  <main className="chat-window">
  {/* Chat messages will be displayed here */}
  <div className="chat-header">
  <h4>Selected Contact</h4>
  </div>
  <div className="message-area">
  {/* Messages */}
  </div>
  <div className="input-area">
  <input type="text" placeholder="Type a message..." />
  <button>Send</button>
  </div>
  </main>
  <aside className="status-area">
  {/* User status and profile info */}
  <h3>Profile</h3>
  <p>Status: Online</p>
  </aside>
  </div>
  );
 }
 

 export default ICQLayout;