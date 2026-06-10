import React, { useState, useEffect, useRef } from 'react';
import ChatPage from './ChatPage';
import MutualFundPage from './MutualFundPage';
import './UnifiedPage.css';

export default function UnifiedPage({ user, selectedModel, threadId, setThreadId }) {
  // Use a split layout: Chat on left/center, MF on right
  return (
    <div className="unified-layout fade-in">
      <div className="unified-left">
        <ChatPage 
          user={user} 
          selectedModel={selectedModel} 
          threadId={threadId} 
          setThreadId={setThreadId} 
        />
      </div>
      <div className="unified-right">
        <MutualFundPage />
      </div>
    </div>
  );
}
