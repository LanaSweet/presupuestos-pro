// Validates and shrinks the uploaded logo so localStorage stays small (research R2).

const MAX_BYTES = 1024 * 1024;
const MAX_WIDTH = 600;
const MAX_HEIGHT = 200;

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('No se ha podido leer la imagen'));
    reader.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('La imagen no es válida'));
    image.src = src;
  });
}

/** Returns a PNG/JPEG data URL that fits in 600 × 200 px. Throws with a Spanish message. */
export async function processLogo(file) {
  if (file.type !== 'image/png' && file.type !== 'image/jpeg') {
    throw new Error('El logo debe ser PNG o JPG');
  }
  if (file.size > MAX_BYTES) {
    throw new Error('El logo no puede pasar de 1 MB');
  }

  const image = await loadImage(await readAsDataUrl(file));
  const scale = Math.min(1, MAX_WIDTH / image.naturalWidth, MAX_HEIGHT / image.naturalHeight);
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (file.type === 'image/jpeg') {
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
  }
  context.drawImage(image, 0, 0, width, height);

  return file.type === 'image/png' ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg', 0.9);
}
