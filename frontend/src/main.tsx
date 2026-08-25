import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { ErrorBoundary } from './componentes/common/ErrorBoundary'

// Workaround para evitar que Google Translate rompa (ponga en blanco) la aplicación React
if (typeof Node === 'function' && Node.prototype) {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function (child: Node): Node {
    if (child.parentNode !== this && child.parentNode) {
      return originalRemoveChild.call(child.parentNode, child);
    }
    return originalRemoveChild.call(this, child);
  } as typeof Node.prototype.removeChild;

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function (newNode: Node, referenceNode: Node | null): Node {
    if (referenceNode && referenceNode.parentNode !== this && referenceNode.parentNode) {
      return originalInsertBefore.call(referenceNode.parentNode, newNode, referenceNode);
    }
    return originalInsertBefore.call(this, newNode, referenceNode);
  } as typeof Node.prototype.insertBefore;

  const originalReplaceChild = Node.prototype.replaceChild;
  Node.prototype.replaceChild = function (newChild: Node, oldChild: Node): Node {
    if (oldChild.parentNode !== this && oldChild.parentNode) {
      return originalReplaceChild.call(oldChild.parentNode, newChild, oldChild);
    }
    return originalReplaceChild.call(this, newChild, oldChild);
  } as typeof Node.prototype.replaceChild;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
