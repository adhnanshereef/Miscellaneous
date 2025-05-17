// A utility script to create notification sound files using the Web Audio API
// Run with Node.js to generate MP3 files for the countdown timer notification sounds

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('Creating sound files for countdown timer notifications...');
console.log('This script requires FFmpeg to be installed and available in your PATH.');
console.log('Sound files will be created in the src/assets/sounds directory.');

// Check if ffmpeg is available
exec('ffmpeg -version', (error) => {
  if (error) {
    console.error('Error: FFmpeg is not installed or not in your PATH.');
    console.log('Please install FFmpeg and try again.');
    return;
  }
  
  console.log('FFmpeg found, proceeding to create sound files...');
  
  // Create bell.wav (simple bell sound)
  const bellCommand = `ffmpeg -f lavfi -i "sine=frequency=880:duration=1,sine=frequency=440:duration=1" -af "afade=t=in:ss=0:d=0.1,afade=t=out:st=1.8:d=0.2" -y "${path.join(__dirname, 'bell.mp3')}"`;
  
  // Create chime.wav (series of ascending tones)
  const chimeCommand = `ffmpeg -f lavfi -i "sine=frequency=523.25:duration=0.3,sine=frequency=659.25:duration=0.3,sine=frequency=783.99:duration=0.4" -af "afade=t=out:st=0.8:d=0.2" -y "${path.join(__dirname, 'chime.mp3')}"`;
  
  // Create digital.wav (electronic beep)
  const digitalCommand = `ffmpeg -f lavfi -i "sine=frequency=1000:duration=0.1,sine=frequency=800:duration=0.1,sine=frequency=1200:duration=0.2" -af "afade=t=out:st=0.3:d=0.1" -y "${path.join(__dirname, 'digital.mp3')}"`;
  
  // Create gentle.wav (soft notification sound)
  const gentleCommand = `ffmpeg -f lavfi -i "sine=frequency=392:duration=0.8" -af "afade=t=in:ss=0:d=0.2,afade=t=out:st=0.6:d=0.2" -y "${path.join(__dirname, 'gentle.mp3')}"`;

  // Execute the commands
  console.log('Creating bell sound...');
  exec(bellCommand, (error) => {
    if (error) {
      console.error('Error creating bell sound:', error);
    } else {
      console.log('Bell sound created successfully.');
    }
  });

  console.log('Creating chime sound...');
  exec(chimeCommand, (error) => {
    if (error) {
      console.error('Error creating chime sound:', error);
    } else {
      console.log('Chime sound created successfully.');
    }
  });

  console.log('Creating digital sound...');
  exec(digitalCommand, (error) => {
    if (error) {
      console.error('Error creating digital sound:', error);
    } else {
      console.log('Digital sound created successfully.');
    }
  });

  console.log('Creating gentle sound...');
  exec(gentleCommand, (error) => {
    if (error) {
      console.error('Error creating gentle sound:', error);
    } else {
      console.log('Gentle sound created successfully.');
    }
  });
});
