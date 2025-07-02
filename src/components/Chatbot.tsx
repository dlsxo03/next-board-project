'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './Chatbot.module.css';

const OLLAMA_API_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'deepseek-r1:latest';

export default function Chatbot() {
  const [messages, setMessages] = useState<{ role: string, content: string }[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chatbotMessages');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState<boolean | null>(null);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [panelWidth, setPanelWidth] = useState<number | null>(null);
  const [panelHeight, setPanelHeight] = useState<number | null>(null);
  const resizing = useRef(false);
  const resizingTop = useRef(false);
  const resizingCorner = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const startWidth = useRef(400);
  const startHeight = useRef(600);
  const startCorner = useRef({ x: 0, y: 0, width: 400, height: 600 });

  // 좌측(가로) 리사이저
  const onMouseDown = (e: React.MouseEvent) => {
    resizing.current = true;
    startX.current = e.clientX;
    startWidth.current = panelWidth || 400;
    document.body.style.cursor = 'ew-resize';
  };
  // 위쪽(세로) 리사이저
  const onMouseDownTop = (e: React.MouseEvent) => {
    resizingTop.current = true;
    startY.current = e.clientY;
    startHeight.current = panelHeight || 600;
    document.body.style.cursor = 'ns-resize';
  };
  // 대각선(코너) 리사이저
  const onMouseDownCorner = (e: React.MouseEvent) => {
    resizingCorner.current = true;
    startCorner.current = {
      x: e.clientX,
      y: e.clientY,
      width: panelWidth || 400,
      height: panelHeight || 600,
    };
    document.body.style.cursor = 'nwse-resize';
  };

  React.useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (resizing.current) {
        let newWidth = startWidth.current + (startX.current - e.clientX);
        newWidth = Math.max(320, Math.min(1200, newWidth));
        setPanelWidth(newWidth);
      }
      if (resizingTop.current) {
        let newHeight = startHeight.current + (startY.current - e.clientY);
        newHeight = Math.max(320, Math.min(900, newHeight));
        setPanelHeight(newHeight);
      }
      if (resizingCorner.current) {
        let newWidth = startCorner.current.width - (e.clientX - startCorner.current.x);
        let newHeight = startCorner.current.height - (e.clientY - startCorner.current.y);
        newWidth = Math.max(320, Math.min(1200, newWidth));
        newHeight = Math.max(320, Math.min(900, newHeight));
        setPanelWidth(newWidth);
        setPanelHeight(newHeight);
      }
    };
    const onMouseUp = () => {
      resizing.current = false;
      resizingTop.current = false;
      resizingCorner.current = false;
      document.body.style.cursor = '';
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [panelWidth, panelHeight]);

  // 최초 마운트 시 localStorage에서 값 읽어오기
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedOpen = localStorage.getItem('chatbotOpen');
      setOpen(savedOpen === null ? true : savedOpen === 'true');
      const savedWidth = localStorage.getItem('chatbotWidth');
      setPanelWidth(savedWidth ? Number(savedWidth) : 400);
      const savedHeight = localStorage.getItem('chatbotHeight');
      setPanelHeight(savedHeight ? Number(savedHeight) : 600);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chatbotOpen', String(open));
      localStorage.setItem('chatbotWidth', String(panelWidth));
      localStorage.setItem('chatbotHeight', String(panelHeight));
    }
  }, [open, panelWidth, panelHeight]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chatbotMessages', JSON.stringify(messages));
    }
  }, [messages]);

  const handleReset = () => {
    setMessages([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('chatbotMessages');
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);
    setStreamingMessage('');

    try {
      const res = await fetch(OLLAMA_API_URL + '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          messages: [...messages, userMessage],
        }),
      });

      // NDJSON 스트림 파싱 및 실시간 표시
      const reader = res.body?.getReader();
      let assistantMessage = '';
      if (reader) {
        const decoder = new TextDecoder();
        let { value, done } = await reader.read();
        let buffer = '';
        while (!done) {
          buffer += decoder.decode(value, { stream: true });
          let lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            if (line.trim()) {
              const json = JSON.parse(line);
              if (json.message && json.message.content) {
                assistantMessage += json.message.content;
                setStreamingMessage(assistantMessage); // 실시간 표시
              }
            }
          }
          ({ value, done } = await reader.read());
        }
        // 남은 버퍼 처리
        if (buffer.trim()) {
          const json = JSON.parse(buffer);
          if (json.message && json.message.content) {
            assistantMessage += json.message.content;
            setStreamingMessage(assistantMessage);
          }
        }
      }
      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage || '응답 없음' }]);
      setStreamingMessage('');
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: '오류: ' + e.message }]);
      setStreamingMessage('');
    }
    setLoading(false);
  };

  // 값이 null이면 렌더링하지 않음(깜빡임 방지)
  if (open === null || panelWidth === null || panelHeight === null) return null;

  return (
    <>
      {open ? (
        <div className={styles.chatbotRoot} style={{ width: panelWidth, height: panelHeight }}>
          <div
            className={styles.chatbotPanel}
            style={{ width: '100%', height: '100%' }}
          >
            <div
              onMouseDown={onMouseDownTop}
              className={styles.chatbotResizerTop}
              title="세로 크기 조절"
            />
            <div className={styles.chatbotHeader}>
              <div className={styles.chatbotHeaderLeft}>
                <span>CHAT</span>
                <button
                  onClick={handleReset}
                  className={styles.chatbotResetBtn}
                  title="채팅 초기화"
                >
                  <span role="img" aria-label="초기화">⟳</span>
                </button>
              </div>
              <button
                onClick={() => setOpen(false)}
                className={styles.chatbotCloseBtn}
                title="접기"
              >
                &raquo;
              </button>
            </div>
            <div className={styles.chatbotBody}>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`${styles.chatbotMsg} ${msg.role === 'user' ? styles.chatbotMsgUser : styles.chatbotMsgBot}`}
                >
                  <b>{msg.role === 'user' ? '나' : '챗봇'}:</b>
                  <div className={`${styles.chatbotMarkdown} markdown-body`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  </div>
                  {msg.role === 'assistant' && <hr className={styles.chatbotHr} />}
                </div>
              ))}
              {loading && streamingMessage && (
                <div className={`${styles.chatbotMsg} ${styles.chatbotMsgBot}`}>
                  <b>챗봇:</b>
                  <div className={`${styles.chatbotMarkdown} markdown-body`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamingMessage}</ReactMarkdown>
                  </div>
                </div>
              )}
              {loading && !streamingMessage && <div>답변 생성 중...</div>}
            </div>
            <div className={styles.chatbotInputArea}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                className={styles.chatbotInput}
                placeholder="메시지를 입력하세요"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className={styles.chatbotSendBtn}
              >
                <span role="img" aria-label="전송">➤</span>
              </button>
            </div>
            <div
              onMouseDown={onMouseDown}
              className={styles.chatbotResizer}
              title="가로 크기 조절"
            />
            <div
              onMouseDown={onMouseDownCorner}
              className={styles.chatbotResizerCorner}
              title="대각선 크기 조절"
            />
          </div>
        </div>
      ) : (
        <div className={styles.chatbotPopupBtnWrapper}>
          <button
            onClick={() => setOpen(true)}
            className={styles.chatbotOpenBtn}
            title="챗봇 열기"
          >
            <span role="img" aria-label="챗봇">💬</span>
          </button>
        </div>
      )}
    </>
  );
} 