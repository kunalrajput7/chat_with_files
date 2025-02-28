// Helper functions to handle localStorage
export const loadState = (key) => {
    try {
      const serializedState = localStorage.getItem(key);
      return serializedState ? JSON.parse(serializedState) : null;
    } catch (e) {
      console.error("Error loading state from localStorage:", e);
      return null;
    }
  };
  
  export const saveState = (key, state) => {
    try {
      const serializedState = JSON.stringify(state);
      localStorage.setItem(key, serializedState);
    } catch (e) {
      console.error("Error saving state to localStorage:", e);
    }
  };
  
  // For PDF file storage
  export const storePDF = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        localStorage.setItem('currentPDF', reader.result);
        resolve();
      };
      reader.readAsDataURL(file);
    });
  };
  
  export const getStoredPDF = () => {
    const pdfData = localStorage.getItem('currentPDF');
    if (!pdfData) return null;
    
    return {
      name: localStorage.getItem('pdfName') || 'document.pdf',
      data: pdfData
    };
  };