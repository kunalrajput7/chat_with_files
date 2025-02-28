// For Chat History
export const saveChatHistory = (history) => {
    localStorage.setItem('chatHistory', JSON.stringify(history));
  };
  
  export const loadChatHistory = () => {
    const history = localStorage.getItem('chatHistory');
    return history ? JSON.parse(history) : [];
  };
  
  // For PDF File
  export const savePDF = async (file) => {
    return new Promise((resolve) => {
      const request = indexedDB.open('pdfChatDB', 1);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        db.createObjectStore('files', { keyPath: 'id' });
      };
  
      request.onsuccess = (event) => {
        const db = event.target.result;
        const tx = db.transaction('files', 'readwrite');
        const store = tx.objectStore('files');
        store.put({ id: 'currentPDF', file });
        resolve();
      };
    });
  };
  
  export const loadPDF = async () => {
    return new Promise((resolve) => {
      const request = indexedDB.open('pdfChatDB', 1);
  
      request.onsuccess = (event) => {
        const db = event.target.result;
        const tx = db.transaction('files', 'readonly');
        const store = tx.objectStore('files');
        const request = store.get('currentPDF');
        
        request.onsuccess = () => {
          resolve(request.result?.file || null);
        };
      };
    });
  };