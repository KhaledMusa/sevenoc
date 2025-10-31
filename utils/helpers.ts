export const formatDuration = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) {
    return '00:00';
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const getAudioDuration = (file: File): Promise<number> => {
  return new Promise((resolve) => {
    const audio = document.createElement('audio');
    const objectUrl = URL.createObjectURL(file);
    audio.onloadedmetadata = () => {
      resolve(Math.round(audio.duration));
      URL.revokeObjectURL(objectUrl);
    };
    audio.onerror = () => {
      resolve(0); // Resolve with 0 if there's an error
      URL.revokeObjectURL(objectUrl);
    };
    audio.src = objectUrl;
  });
};
