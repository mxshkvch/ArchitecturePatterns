// // shared/ui/DebugInfo.jsx
// import React, { useState } from 'react';

// export const DebugInfo = ({ data, title = 'Debug Information' }) => {
//   const [isOpen, setIsOpen] = useState(false);

//   // Показываем только в development режиме
//   if (process.env.NODE_ENV !== 'development') {
//     return null;
//   }

//   return (
//     <div style={styles.container}>
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         style={styles.toggleButton}
//         onMouseEnter={(e) => {
//           e.target.style.backgroundColor = '#e2e8f0';
//         }}
//         onMouseLeave={(e) => {
//           e.target.style.backgroundColor = '#f1f5f9';
//         }}
//       >
//         {isOpen ? '▼' : '▶'} {title}
//       </button>
//       {isOpen && (
//         <pre style={styles.content}>
//           {JSON.stringify(data, null, 2)}
//         </pre>
//       )}
//     </div>
//   );
// };

// const styles = {
//   container: {
//     marginTop: '20px',
//     textAlign: 'left'
//   },
//   toggleButton: {
//     backgroundColor: '#f1f5f9',
//     border: '1px solid #e2e8f0',
//     borderRadius: '6px',
//     padding: '8px 12px',
//     cursor: 'pointer',
//     fontSize: '12px',
//     color: '#64748b',
//     transition: 'all 0.2s',
//     fontFamily: 'monospace'
//   },
//   content: {
//     backgroundColor: '#f8fafc',
//     border: '1px solid #e2e8f0',
//     borderRadius: '6px',
//     padding: '12px',
//     marginTop: '8px',
//     fontSize: '11px',
//     overflow: 'auto',
//     maxHeight: '300px',
//     fontFamily: 'monospace',
//     color: '#1e293b'
//   }
// };

// export default DebugInfo;