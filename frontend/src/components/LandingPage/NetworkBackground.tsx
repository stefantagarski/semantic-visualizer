{/* TODO IMPLEMENT IT WHEN CHANGING THE UI */}
{/*  A React component that renders an animated network background . */}

// import { useEffect, useRef } from 'react';
//
// const NetworkBackground = () => {
//     const canvasRef = useRef<HTMLCanvasElement>(null);
//
//     useEffect(() => {
//         const canvas = canvasRef.current;
//         if (!canvas) return;
//
//         const ctx = canvas.getContext('2d');
//         if (!ctx) return;
//
//         canvas.width = window.innerWidth;
//         canvas.height = window.innerHeight;
//
//         // Node class
//         class Node {
//             x: number;
//             y: number;
//             vx: number;
//             vy: number;
//             radius: number;
//
//             constructor() {
//                 this.x = Math.random() * canvas!.width;
//                 this.y = Math.random() * canvas!.height;
//                 this.vx = (Math.random() - 0.5) * 0.4;
//                 this.vy = (Math.random() - 0.5) * 0.4;
//                 this.radius = Math.random() * 3 + 2;
//             }
//
//             update() {
//                 this.x += this.vx;
//                 this.y += this.vy;
//
//                 if (this.x < 0 || this.x > canvas!.width) this.vx *= -1;
//                 if (this.y < 0 || this.y > canvas!.height) this.vy *= -1;
//             }
//
//             draw() {
//                 if (!ctx) return;
//                 ctx.beginPath();
//                 ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
//                 ctx.fillStyle = 'rgba(74, 111, 165, 0.6)';
//                 ctx.fill();
//                 // Add glow effect
//                 ctx.shadowBlur = 8;
//                 ctx.shadowColor = 'rgba(74, 111, 165, 0.4)';
//             }
//         }
//
//         // Create nodes
//         const nodes: Node[] = [];
//         const nodeCount = Math.floor((canvas.width * canvas.height) / 12000);
//
//         for (let i = 0; i < nodeCount; i++) {
//             nodes.push(new Node());
//         }
//
//         // Animation loop
//         function animate() {
//             if (!ctx || !canvas) return;
//
//             ctx.clearRect(0, 0, canvas.width, canvas.height);
//
//             // Update and draw nodes
//             nodes.forEach(node => {
//                 node.update();
//                 node.draw();
//             });
//
//             // Draw connections
//             for (let i = 0; i < nodes.length; i++) {
//                 for (let j = i + 1; j < nodes.length; j++) {
//                     const dx = nodes[i].x - nodes[j].x;
//                     const dy = nodes[i].y - nodes[j].y;
//                     const distance = Math.sqrt(dx * dx + dy * dy);
//
//                     if (distance < 180) {
//                         ctx.beginPath();
//                         ctx.moveTo(nodes[i].x, nodes[i].y);
//                         ctx.lineTo(nodes[j].x, nodes[j].y);
//                         ctx.strokeStyle = `rgba(74, 111, 165, ${0.25 * (1 - distance / 180)})`;
//                         ctx.lineWidth = 1;
//                         ctx.stroke();
//                     }
//                 }
//             }
//
//             requestAnimationFrame(animate);
//         }
//
//         animate();
//
//         // Handle resize
//         const handleResize = () => {
//             canvas.width = window.innerWidth;
//             canvas.height = window.innerHeight;
//         };
//
//         window.addEventListener('resize', handleResize);
//
//         return () => {
//             window.removeEventListener('resize', handleResize);
//         };
//     }, []);
//
//     return (
//         <canvas
//             ref={canvasRef}
//             className="fixed inset-0 pointer-events-none opacity-70"
//             style={{ zIndex: 0 }}
//         />
//     );
// };
//
// export default NetworkBackground;
