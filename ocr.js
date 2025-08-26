function scanImage(input) {
  const file = input.files[0];
  if (!file) return;

  const img = new Image();
  img.src = URL.createObjectURL(file);
  img.onload = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const scale = 2;
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      const threshold = avg > 130 ? 255 : 0;
      data[i] = data[i + 1] = data[i + 2] = threshold;
    }
    ctx.putImageData(imageData, 0, 0);

    Tesseract.recognize(canvas.toDataURL(), 'eng', {
      logger: m => console.log(m),
      tessedit_char_whitelist: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.,!?()[]{}:;\'"- ',
      preserve_interword_spaces: 1,
      oem: 1,
      psm: 6
    }).then(({ data: { text } }) => {
      document.getElementById('noteInput').value = text || 'No text detected.';
    }).catch(err => {
      console.warn('OCR issue:', err);
      document.getElementById('noteInput').value = 'Unable to extract text.';
    });
  };
}

function handleDrop(event) {
  event.preventDefault();
  const file = event.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    scanImage({ files: [file] });
  }
}

function startSpeechToText() {
  if (!('webkitSpeechRecognition' in window)) {
    alert("Speech recognition not supported.");
    return;
  }
  const recognition = new webkitSpeechRecognition();
  recognition.lang = 'en-US';
  recognition.onresult = e => {
    document.getElementById('noteInput').value += ' ' + e.results[0][0].transcript;
  };
  recognition.start();
}
