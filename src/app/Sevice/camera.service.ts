import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
 declare var cv:any
// Now you can use the loaded classifier for face detection

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  isLoaded: any;
  faceCorrect!: boolean
  resolutionCorrect!: boolean
  private cascadeLoaded: boolean = false;
  private cascade: any = null;

  private faceCascade: any = null;

  constructor(private http: HttpClient ) { }
    
  //  using CDN
  // loadOpenCV(): Promise<void> {
  //   return new Promise((resolve, reject) => {
  //     if (this.isLoaded) {
  //       console.log('OpenCV is already loaded');
  //       resolve();
  //       return;
  //     }

  //     // Check if the script already exists in the DOM
  //     if (document.querySelector('script[src="https://docs.opencv.org/4.x/opencv.js"]')) {
  //       console.log('OpenCV script already present, waiting for initialization...');
  //       cv['onRuntimeInitialized'] = () => {
  //         console.log('OpenCV initialized successfully');
  //         this.isLoaded = true;
  //         resolve();
  //       };
  //       return;
  //     }

  //     // Add OpenCV script dynamically
  //     const script = document.createElement('script');
  //     script.src = 'https://docs.opencv.org/4.x/opencv.js';
  //     script.onload = () => {
  //       console.log('OpenCV script loaded, waiting for initialization...');
  //       cv['onRuntimeInitialized'] = () => {
  //         console.log('OpenCV initialized successfully');
  //         this.isLoaded = true;
  //         resolve();
  //       };
  //     };
  //     script.onerror = () => reject('Failed to load OpenCV.js script');
  //     document.body.appendChild(script);
  //   });
  // }




// Load OpenCV script asynchronously and initialize it


      // using Local
      loadCV(): Promise<void> {
        return new Promise((resolve, reject) => {
          if (this.isLoaded) {
            console.log('OpenCV is already loaded.');
            resolve();
            return;
          }
      
          const existingScript = document.querySelector('script[src="/assets/opencv/opencv.js"]');
          if (existingScript) {
            console.log('OpenCV script already present, checking initialization...');
            this.checkCVInitialization(resolve, reject);
            return;
          }
      
          const script = document.createElement('script');
          script.src = '/assets/opencv/opencv.js';
          script.async = true;
          console.log('Loading OpenCV script...');
      
          script.onload = () => {
            console.log('OpenCV script loaded.');
            this.checkCVInitialization(resolve, reject);
          };
      
          script.onerror = (error) => {
            console.error('Failed to load OpenCV script.', error);
            reject(error);
          };
      
          document.body.appendChild(script);
        });
      }
      
      private checkCVInitialization(resolve: () => void, reject: (error: any) => void): void {
        const checkInterval = 100; // Check every 100ms
        const maxAttempts = 50; // Retry for up to 5 seconds
        let attempts = 0;
      
        const intervalId = setInterval(() => {
          console.log(`Checking OpenCV initialization attempt ${attempts + 1}...`);
          if (typeof cv !== 'undefined' && cv.Mat) {
            clearInterval(intervalId);
            console.log('OpenCV detected.');
            if (cv.onRuntimeInitialized) {
              cv.onRuntimeInitialized = () => {
                console.log('OpenCV runtime initialized.');
                this.isLoaded = true;
                resolve();
              };
            } else {
              console.warn('cv.onRuntimeInitialized not present, resolving directly.');
              this.isLoaded = true;
              resolve();
            }
          } else if (attempts >= maxAttempts) {
            clearInterval(intervalId);
            console.error('OpenCV initialization timed out.');
            reject(new Error('OpenCV initialization timed out.'));
          }
          attempts++;
        }, checkInterval);
      }
      

  async loadCascade(): Promise<string> {
    const cascadeFilePath = 'haarcascade_frontalface_default.xml';
    try {
      console.log("Starting loadCascade...");
  
      // Check if the cascade file exists
      let fileExists = false;
      try {
        cv.FS_stat(cascadeFilePath); // Check if the file exists
        fileExists = true;
      } catch (err) {
        fileExists = false; // File does not exist
      }
  
      if (fileExists) {
        console.log(`File ${cascadeFilePath} already exists. Removing...`);
        cv.FS_unlink(cascadeFilePath); // Delete the existing file
      } else {
        console.log("Cascade file not found, no need to delete.");
      }
  
      // Fetch the Haar cascade XML file
      const cascadeData = await lastValueFrom(
        this.http.get('/assets/haarcascade_frontalface_default.xml', { responseType: 'text' })
      );
  
      if (!cascadeData) {
        console.error("Cascade data is undefined or empty.");
        throw new Error("Failed to fetch cascade data.");
      }
  
      console.log("Writing cascade data to the virtual file system...");
      
      try {
          const cascadeBlob = new Blob([cascadeData], { type: 'application/xml' });
          const cascadeUint8Array = new Uint8Array(await cascadeBlob.arrayBuffer());
          cv.FS_createDataFile('/', cascadeFilePath, cascadeUint8Array, true, false);
          console.log(`Cascade file ${cascadeFilePath} written successfully.`);
      } catch (error) {
          // console.error("Error in loadCascade:", error);
      }
 
      // Load the Haar cascade
      console.log("Attempting to load Haar cascade...");
      const faceCascade = new cv.CascadeClassifier();
      const isLoaded = faceCascade.load(cascadeFilePath); // Directly use the path
  
      console.log("Haar cascade load status:", isLoaded);
      if (!isLoaded) {
        throw new Error("Failed to load Haar cascade.");
      }
  
      console.log("Haar cascade loaded successfully.");
      return cascadeFilePath;
  
    } catch (error) {
      console.error("Error in loadCascade:", error);
      throw error; // Propagate the error to the caller
    }
  
  }

  // processImage(imageData: ImageData): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this.loadCV()
  //       .then(() => {
  //         console.log('OpenCV loaded successfully.');
  
  //         const canvas = document.createElement('canvas');
  //         const context = canvas.getContext('2d');
  //         if (!context) {
  //           console.error('2D context not available');
  //           reject('2D context not available');
  //           return;
  //         }
  
  //         canvas.width = imageData.width;
  //         canvas.height = imageData.height;
  //         context.putImageData(imageData, 0, 0);
  
  //         const frame = cv.imread(canvas);
  //         const gray = new cv.Mat();
  //         cv.cvtColor(frame, gray, cv.COLOR_RGBA2GRAY);

        
  //         // Load the cascade for face detection
  //         this.loadCascade()
  //           .then((cascadePath) => {
  //             // Log and verify cascadePath is a string
  //             console.log("Loading Haar cascade from path:", cascadePath);
  //             if (typeof cascadePath !== 'string') {
  //               console.error("Cascade path is not a string:", cascadePath);
  //               reject("Cascade path is not a valid string");
  //               return;
  //             }
  
  //              this.faceCascade = new cv.CascadeClassifier();
  //             const isLoaded = this.faceCascade.load(String(cascadePath)); // Ensure the cascade is loaded correctly
  
  //             if (!isLoaded) {
  //               console.error("Failed to load Haar cascade");
  //               reject("Failed to load Haar cascade");
  //               return;
  //             }
  
  //             const faces = new cv.RectVector();
  //             const scaleFactor = 1.1;
  //             const minNeighbors = 3;
  //             const minSize = new cv.Size(30, 30);
  
  //             // Try to detect faces and catch any errors that might occur
  //             try {
  //               this.faceCascade.detectMultiScale(gray, faces, scaleFactor, minNeighbors, 0, minSize);
  //               console.log('Faces detected:', faces.size());
  
  //               if (faces.size() > 0) {
  //                 const face = faces.get(0); // Get the first detected face
  //                 const facePosition = {
  //                   x: face.x,
  //                   y: face.y,
  //                   width: face.width,
  //                   height: face.height,
  //                   centerX: face.x + face.width / 2,
  //                   centerY: face.y + face.height / 2,
  //                 };
  
  //                 console.log('Face position:', facePosition);
  
  //                 // Check if the face is in the correct position
  //                 const frameWidth = imageData.width;
  //                 const frameHeight = imageData.height;
  //                 const positionCorrect =
  //                   facePosition.centerX > frameWidth * 0.3 &&
  //                   facePosition.centerX < frameWidth * 0.7 &&
  //                   facePosition.centerY > frameHeight * 0.3 &&
  //                   facePosition.centerY < frameHeight * 0.7;
  
  //                 if (positionCorrect) {
  //                   resolve({
  //                     faceCorrect: true,
  //                     positionCorrect: true,
  //                     resolutionValid: true,
  //                     facePosition,
  //                     message: 'Face detected in the correct position.',
  //                   });
  //                 } else {
  //                   resolve({
  //                     faceCorrect: true,
  //                     positionCorrect: false,
  //                     resolutionValid: true,
  //                     facePosition,
  //                     message: 'Please adjust your face to the center of the frame.',
  //                   });
  //                 }
  //               } else {
  //                 resolve({
  //                   faceCorrect: false,
  //                   positionCorrect: false,
  //                   resolutionValid:true,
  //                   message: 'No face detected. Please ensure your face is visible to the camera.',
  //                 });
  //               }
  //             } catch (error) {
  //               console.error('Error during face detection:', error);
  //               reject('Error during face detection');
  //             }
  //             // Release resources
  //             this.faceCascade.delete();
  //             faces.delete();
  //             frame.delete();
  //             gray.delete();
  //           })
  //           .catch((cascadeError) => {
  //             console.error('Error loading face cascade:', cascadeError);
  //             reject(cascadeError);
  //           });
  //       })
  //       .catch((opencvError) => {
  //         console.error('Error loading OpenCV:', opencvError);
  //         reject(opencvError);
  //       });
  //   });
  // }


  processImage(imageData: ImageData): Promise<any> {
    return new Promise((resolve, reject) => {
      this.loadCV()
        .then(() => {
          console.log('OpenCV loaded successfully.');
  
          // Create a canvas and get its context
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (!context) {
            console.error('2D context not available');
            reject('2D context not available');
            return;
          }
  
          // Set canvas dimensions and draw the image
          canvas.width = imageData.width;
          canvas.height = imageData.height;
          context.putImageData(imageData, 0, 0);
  
          // Read the image into OpenCV
          const frame = cv.imread(canvas);
          const gray = new cv.Mat();
          cv.cvtColor(frame, gray, cv.COLOR_RGBA2GRAY);
  
          // Apply histogram equalization for better contrast
          cv.equalizeHist(gray, gray);
  
          // Load the Haar cascade for face detection
          this.loadCascade()
            .then((cascadePath) => {
              console.log('Loading Haar cascade from path:', cascadePath);
              if (typeof cascadePath !== 'string') {
                console.error('Cascade path is not a valid string:', cascadePath);
                reject('Cascade path is not valid');
                return;
              }
  
              this.faceCascade = new cv.CascadeClassifier();
              if (!this.faceCascade.load(cascadePath)) {
                console.error('Failed to load Haar cascade');
                reject('Failed to load Haar cascade');
                return;
              }
  
              // Detect faces
              const faces = new cv.RectVector();
              const scaleFactor = 1.1;
              const minNeighbors = 3;
              const minSize = new cv.Size(30, 30);
  
              try {
                this.faceCascade.detectMultiScale(gray, faces, scaleFactor, minNeighbors, 0, minSize);
                console.log('Faces detected:', faces.size());
  
                if (faces.size() > 0) {
                  const face = faces.get(0); // Process the first detected face
                  const facePosition = {
                    x: face.x,
                    y: face.y,
                    width: face.width,
                    height: face.height,
                    centerX: face.x + face.width / 2,
                    centerY: face.y + face.height / 2,
                  };
  
                  console.log('Face position:', facePosition);
  
                  // Check if the face is in the correct position
                  const frameWidth = imageData.width;
                  const frameHeight = imageData.height;
                  const positionCorrect =
                    facePosition.centerX > frameWidth * 0.3 &&
                    facePosition.centerX < frameWidth * 0.7 &&
                    facePosition.centerY > frameHeight * 0.3 &&
                    facePosition.centerY < frameHeight * 0.7;
  
                  if (positionCorrect) {
                    resolve({
                      faceCorrect: true,
                      positionCorrect: true,
                      resolutionValid: true,
                      facePosition,
                      message: 'Face detected in the correct position.',
                    });
                  } else {
                    resolve({
                      faceCorrect: true,
                      positionCorrect: false,
                      resolutionValid: true,
                      facePosition,
                      message: 'Please adjust your face to the center of the frame.',
                    });
                  }
                } else {
                  resolve({
                    faceCorrect: false,
                    positionCorrect: false,
                    resolutionValid: true,
                    message: 'No face detected. Please ensure your face is visible to the camera.',
                  });
                }
              } catch (error) {
                console.error('Error during face detection:', error);
                reject('Error during face detection');
              } finally {
                // Clean up OpenCV resources
                faces.delete();
                this.faceCascade.delete();
                frame.delete();
                gray.delete();
              }
            })
            .catch((cascadeError) => {
              console.error('Error loading face cascade:', cascadeError);
              reject(cascadeError);
            });
        })
        .catch((opencvError) => {
          console.error('Error loading OpenCV:', opencvError);
          reject(opencvError);
        });
    });
  }
  
 
}

