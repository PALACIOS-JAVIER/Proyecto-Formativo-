import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Workaround para evitar que Google Translate rompa (ponga en blanco) la aplicación React
if (typeof Node === 'function' && Node.prototype) {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function (child: Node): Node {
    if (child.parentNode !== this) {
      if (console) console.warn('Cannot remove a child from a different parent', child, this);
      return child;
    }
    return originalRemoveChild.call(this, child);
  } as typeof Node.prototype.removeChild;

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function (newNode: Node, referenceNode: Node | null): Node {
    if (referenceNode && referenceNode.parentNode !== this) {
      if (console) console.warn('Cannot insert before a reference node from a different parent', referenceNode, this);
      return newNode;
    }
    return originalInsertBefore.call(this, newNode, referenceNode);
  } as typeof Node.prototype.insertBefore;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
