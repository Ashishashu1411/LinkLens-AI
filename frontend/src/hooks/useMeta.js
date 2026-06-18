import { useEffect } from 'react';

export function useMeta({ title, description }) {
  useEffect(() => {
    if (title) {
      document.title = title;
    }
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    
    if (description) {
      metaDesc.setAttribute('content', description);
    }
  }, [title, description]);
}
