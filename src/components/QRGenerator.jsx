import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Share2, Printer, X, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QRGenerator = ({ item, type = 'physical', onClose }) => {
  const qrRef = useRef();
  const [copied, setCopied] = React.useState(false);

  // The URL that the QR code will point to
  const publicUrl = `${window.location.origin}/public-item/${item._id}`;

  const downloadQR = () => {
    const svg = qrRef.current.querySelector('svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 100;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 20, 20);
      
      // Add text label
      ctx.fillStyle = 'black';
      ctx.font = 'bold 20px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(item.title.toUpperCase(), canvas.width / 2, img.height + 50);
      ctx.font = '14px Inter, system-ui, sans-serif';
      ctx.fillText('Digital Lost & Found Tag', canvas.width / 2, img.height + 75);
      
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `QR_Tag_${item.title.replace(/\s+/g, '_')}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10 overflow-hidden"
      >
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors">
          <X size={24} className="text-slate-400" />
        </button>

        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
              {type === 'physical' ? 'Your Item Tag' : 'Share Lost Item'}
            </h2>
            <p className="text-slate-500 italic text-sm">
              {type === 'physical' 
                ? 'Print this and stick it on your item before you lose it!' 
                : 'Share this QR code on social media to help find your item!'}
            </p>
          </div>

          <div ref={qrRef} className="bg-white p-8 rounded-[2.5rem] shadow-inner border-2 border-slate-50 inline-block mx-auto relative group">
            <QRCodeSVG 
              value={publicUrl} 
              size={200} 
              level="H"
              includeMargin={false}
              className="mx-auto"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {type === 'physical' ? (
              <>
                <button 
                  onClick={downloadQR}
                  className="flex flex-col items-center gap-2 p-6 bg-primary-50 text-primary-600 rounded-3xl hover:bg-primary-100 transition-all border border-primary-100 group"
                >
                  <Download size={24} className="group-hover:translate-y-0.5 transition-transform" />
                  <span className="font-bold text-xs uppercase tracking-widest">Download</span>
                </button>
                <button 
                  onClick={() => window.print()}
                  className="flex flex-col items-center gap-2 p-6 bg-slate-50 text-slate-600 rounded-3xl hover:bg-slate-100 transition-all border border-slate-100 group"
                >
                  <Printer size={24} className="group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-xs uppercase tracking-widest">Print Tag</span>
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={copyLink}
                  className="flex flex-col items-center gap-2 p-6 bg-blue-50 text-blue-600 rounded-3xl hover:bg-blue-100 transition-all border border-blue-100 group"
                >
                  {copied ? <Check size={24} className="text-green-500" /> : <Copy size={24} />}
                  <span className="font-bold text-xs uppercase tracking-widest">{copied ? 'Copied!' : 'Copy Link'}</span>
                </button>
                <button 
                  onClick={downloadQR}
                  className="flex flex-col items-center gap-2 p-6 bg-primary-50 text-primary-600 rounded-3xl hover:bg-primary-100 transition-all border border-primary-100 group"
                >
                  <Download size={24} />
                  <span className="font-bold text-xs uppercase tracking-widest">Save Image</span>
                </button>
              </>
            )}
          </div>
          
          <div className="pt-4 flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <Share2 size={20} className="text-primary-500" />
            <p className="text-[10px] text-slate-500 font-medium leading-tight text-left">
              Scanning this QR will lead to your public profile where people can safely contact you without seeing your phone number.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default QRGenerator;
