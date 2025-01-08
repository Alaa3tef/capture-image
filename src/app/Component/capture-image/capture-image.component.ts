import { Component, ElementRef, ViewChild } from '@angular/core';
import { ImageCroppedEvent, ImageCropperComponent, ImageTransform } from 'ngx-image-cropper';
import { ToastrService } from 'ngx-toastr';
import { CameraService } from '../../Sevice/camera.service';

@Component({
  selector: 'app-capture-image',
  standalone: true,
  imports: [ImageCropperComponent],
  templateUrl: './capture-image.component.html',
  styleUrl: './capture-image.component.css'
})
export class CaptureImageComponent {
  croppedImageBase64:string| null = null;
 // @ViewChild('video') videoElement!: ElementRef<HTMLVideoElement>;
 @ViewChild('video') videoElement!: ElementRef<HTMLVideoElement>;
 @ViewChild('canvasOverlay') canvasElement!: ElementRef<HTMLCanvasElement>;

 imageChangedEvent: any = null;
 croppedImageBlob!: Blob |null; // Blob instead of base64
 croppedFile!: File |null; // File (optional)
 stream: MediaStream |null=null;
 transform: ImageTransform = { scale: 1 }; // For zoom in/out
 croppedImage: string | null = null; // To store the base64 image and display it in the cropper
 nationalities!: any[];
 religions!: any[];
 bloodTypes!: any[];
 genders!: any[];
 stages!: any[];
 sofofs!: any[];
 guardians!: any[];
 maritalStatuses!: any[];
 enabledInputs!: boolean;
 jobTitles!: any[];
 courses!: any[];
 schools!: any[];
 isLoading: boolean = false;
 messageForCamer!:string
 isCroppedValid:boolean |null=null
  canvas: any;
  canvasEl: any;
  canvasRef: any;
  displaySize: any;
  detection: any;
  resizedDetections: any;
  videoInput:any;
  elRef!:ElementRef
 constructor(private toaster:ToastrService ,private openCVService:CameraService){}

//  async ngOnInit() {
//   const tiyface="/assets/models"
//   console.log("file",tiyface)
//   await Promise.all([faceapi.nets.tinyFaceDetector.loadFromUri(tiyface),
//   await faceapi.nets.faceLandmark68Net.loadFromUri('/assets/models'),
//   await faceapi.nets.faceRecognitionNet.loadFromUri('/assets/models'),
//   await faceapi.nets.faceExpressionNet.loadFromUri('/assets/models'),]).then(() => this.openCamera());
//   }

 openCamera(): void {
  // Stop the current stream if it exists
  if (this.stream) {
    this.stream.getTracks().forEach(track => track.stop());
  }

  // Reset the cropped image
  this.croppedImage = null;

  const constraints = { video: true };

  navigator.mediaDevices.getUserMedia(constraints)
    .then((stream) => {
      this.stream = stream;
      const video = this.videoElement.nativeElement!;
      video.srcObject = stream;
      
      
      // Wait for video metadata to be loaded
      video.onloadedmetadata = () => {
        video.play(); // Start playing the video
         //this.drawFaceFrame(); // Call the method to draw the face frame
       // this.detectFaceLandmarks( video, this.canvasElement.nativeElement!)
       this.drawOverlay()
      };
      
    })
    .catch((error) => {
      console.error(error);
      this.toaster.error(`برجاء توصيل الكاميرا`, 'خطاء', {
        positionClass: 'toast-bottom-center',
        closeButton: true,
        progressBar: true
      });
    });
}


// Draw a face frame on the overlay canvas
drawFaceFrame(): void {
  console.log("llll")
  const canvas = this.canvasElement.nativeElement!;
  const context = canvas.getContext('2d');

  if (!context) {
    console.error('Failed to get canvas context.');
    return;
  }

  const video = this.videoElement.nativeElement!;
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  // Clear the canvas
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Draw a green face frame
  context.strokeStyle = '#00FF00'; // Green frame color
  context.lineWidth = 3;

  const frameWidth = canvas.width * 0.6;
  const frameHeight = canvas.height * 0.6;
  const frameX = (canvas.width - frameWidth) / 2;
  const frameY = (canvas.height - frameHeight) / 2;

  // context.strokeRect(frameX, frameY, frameWidth, frameHeight);

  // Draw a face silhouette inside the frame
  const faceRadius = frameWidth * 0.2; // Adjust the face size
  const faceCenterX = canvas.width / 2;
  const faceCenterY = frameY + frameHeight * 0.4;

  // Draw the circular head
  context.beginPath();
  context.arc(faceCenterX, faceCenterY, faceRadius, 0, Math.PI * 2);
  context.stroke();

  // Draw the shoulders
  const shoulderWidth = frameWidth * 0.;
  const shoulderHeight = frameHeight * 0.3;
  context.beginPath();
  context.moveTo(faceCenterX - shoulderWidth / 2, faceCenterY + faceRadius);
  context.lineTo(faceCenterX + shoulderWidth / 2, faceCenterY + faceRadius);
  context.lineTo(faceCenterX + shoulderWidth / 4, faceCenterY + faceRadius + shoulderHeight);
  context.lineTo(faceCenterX - shoulderWidth / 4, faceCenterY + faceRadius + shoulderHeight);
  context.closePath();
  context.stroke();

  // Optionally, draw alignment text
  context.font = '16px Arial';
  context.fillStyle = '#FFFFFF';
  context.textAlign = 'center';
  context.fillText('Align your face within the frame', canvas.width / 2, frameY - 10);
}

// drawOverlay(): void {
//   console.log('Drawing overlay...');
//   const video = this.videoElement.nativeElement;
//   const canvas = this.canvasElement.nativeElement as HTMLCanvasElement;
//   const ctx = canvas.getContext('2d')!;

//   // Ensure video is playing
//   video.play();

//   // Set canvas size to match video
//   canvas.width = video.videoWidth || 640; // Default size if videoWidth is unavailable
//   canvas.height = video.videoHeight || 480; // Default size if videoHeight is unavailable

//   const uploadedImage = new Image();
//   uploadedImage.src = '/assets/human.png11.png'; // Replace with the uploaded image path
  
//   uploadedImage.onload = () => {
//     const draw = () => {
//       // Clear previous drawings
//       ctx.clearRect(0, 0, canvas.width, canvas.height);

//       // Define the human frame size (this can be adjusted)
//       const humanWidth = canvas.width * 0.8; // Make the width 40% of the canvas
//       const humanHeight = canvas.height * 0.75; // Make the height 80% of the canvas
//       const humanX = (canvas.width - humanWidth) / 2; // Center horizontally
//       const humanY = (canvas.height - humanHeight) / 2; // Center vertically

//       // Scale the image to fit within the human frame
//       ctx.drawImage(uploadedImage, humanX, humanY, humanWidth, humanHeight);
//       // Keep updating if video is playing
//       if (!video.paused && !video.ended) {
//         requestAnimationFrame(draw);
//       }
//     };

//     draw();
//   };
// }


//   startValidation(): Promise<boolean> {
//     const video = this.videoElement.nativeElement;
//     const canvas = this.canvasElement.nativeElement;
//     const context = canvas.getContext('2d');
  
//     return new Promise((resolve, reject) => {
//       if (!context) {
//         this.toaster.error('Failed to get video context.', 'Error');
//         reject(false);
//         return;
//       }
  
//       canvas.width = video.videoWidth;
//       canvas.height = video.videoHeight;
//       context.drawImage(video, 0, 0, canvas.width, canvas.height);
  
//       const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
//       console.log("imagedata",imageData)
//       this.openCVService.processImage(imageData)
//         .then((result) => {
//           console.log("result",result)
//           const { faceCorrect, resolutionCorrect } = result;

//           if (!faceCorrect) {
//             this.toaster.warning("not face to detect");
//             resolve(false);
//           } 
//           // else if (!resolutionCorrect) {
//           //   this.toaster.warning('Camera resolution is too low. Use a higher-quality camera.', 'Resolution Warning');
//           //   resolve(false);
//           // } 
          
//           else {
//             this.toaster.success('Face detected successfully.', result.message);
//             resolve(true);
//           }
//         })
//         .catch((error) => {
//           console.error('Error during validation:', error);
//           this.toaster.error('Validation failed. Please try again.', 'Error');
//           reject(false);
//         });
//     });
//   }
  
//   /**
//    * Capture an image from the video stream and convert it to base64
//    */

//   captureImage(): void {

//     //this.openCVService.resetCascadeFiles()
//     if (!this.stream || !this.stream.active) {
//       this.toaster.error('من فضلك قم بفتح الكاميرا', 'خطأ', {
//         positionClass: 'toast-bottom-center',
//         closeButton: true,
//         progressBar: true
//       });
//       return; // Exit the function if the camera is not active
//     }
//     const video = this.videoElement.nativeElement;
//     const canvas = document.createElement('canvas');
//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;
//     const context = canvas.getContext('2d');
  
//     // Wait for validation
//     this.startValidation().then((isValid) => {
//       console.log("isvalid",isValid)
//       if (isValid && context) {
//         context.drawImage(video, 0, 0, canvas.width, canvas.height);
//         this.croppedImage = canvas.toDataURL('image/png'); // Store image to pass to cropper
//         console.log('Image captured successfully:', this.croppedImage);
//       } else {
//         this.toaster.error('Image capture aborted: Validation failed.');
//       }
//     }).catch((error) => {
//       console.error('Validation failed, unable to capture image:', error);
//     });
  
//     // Trigger validation when video metadata is loaded
//     video.onloadedmetadata = () => {
//       this.startValidation();
//     };
//   }

drawOverlay(): void {
  console.log('Drawing overlay...');
  const video = this.videoElement.nativeElement;
  const canvas = this.canvasElement.nativeElement as HTMLCanvasElement;
  const ctx = canvas.getContext('2d')!;

  // Set canvas size to match video dimensions
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;

  const overlayImage = new Image();
  overlayImage.src = '/assets/human.png11.png'; // Replace with your guide image path

  overlayImage.onload = () => {
    const draw = () => {
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw the video feed
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Define the guide dimensions and position
      const guideWidth = canvas.width * 1;
      const guideHeight = canvas.height * 0.99;
      const guideX = (canvas.width - guideWidth) / 2;
      const guideY = (canvas.height - guideHeight) / 2;

      // Draw the overlay guide
      ctx.drawImage(overlayImage, guideX, guideY, guideWidth, guideHeight);

      // Continue drawing as long as the video is playing
      if (!video.paused && !video.ended) {
        requestAnimationFrame(draw);
      }
    };

    draw();
  };
}


startValidation(): Promise<boolean> {
  const video = this.videoElement.nativeElement;
  const canvas = this.canvasElement.nativeElement;
  const context = canvas.getContext('2d');

  return new Promise((resolve, reject) => {
    if (!context || !video) {
      console.error('Failed to initialize video or canvas.');
      reject(false);
      return;
    }

    // Set canvas size
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    // Draw the video frame on the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get the image data from the canvas
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    if (!imageData || !imageData.data || imageData.data.length === 0) {
      console.error('Image data is invalid or empty.');
      reject(false);
      return;
    }

    // Process the image
    this.openCVService.processImage(imageData).then((result) => {
      console.log('Validation result:', result);

      if (!result || !result.faceCorrect) {
        this.toaster.warning(' No valid face detected.');
        resolve(false);
        return;
      }

      // Define the expected frame area
      const frameArea = {
        x: canvas.width * 0.2, // Adjust as per your overlay dimensions
        y: canvas.height * 0.2,
        width: canvas.width * 0.6,
        height: canvas.height * 0.6,
      };

      const facePosition = result.facePosition;

      // Check if the face is inside the frame
      const isFaceInsideFrame =
        facePosition.x >= frameArea.x &&
        facePosition.y >= frameArea.y &&
        facePosition.x + facePosition.width <= frameArea.x + frameArea.width &&
        facePosition.y + facePosition.height <= frameArea.y + frameArea.height;

       
        
      if (isFaceInsideFrame) {
        this.toaster.success('Face is in the correct position.');
        console.log('Message:', result.message);
        resolve(true);
      } else {
        this.toaster.warning(' Face is not inside the frame.');
        console.log('Message:', result.message || 'Please position your face inside the frame.');
        resolve(false);
      }
    }).catch((error) => {
      console.error('Error during validation:', error);
      reject(false);
    });
  });
}



captureImage(): void {
      //this.openCVService.resetCascadeFiles()
      if (!this.stream || !this.stream.active) {
        this.toaster.error('من فضلك قم بفتح الكاميرا', 'خطأ', {
          positionClass: 'toast-bottom-center',
          closeButton: true,
          progressBar: true
        });
        return; // Exit the function if the camera is not active
      }
      const video = this.videoElement.nativeElement;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
    
      // Wait for validation
      this.startValidation().then((isValid) => {
        console.log("isvalid",isValid)
        if (isValid && context) {
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          this.croppedImage = canvas.toDataURL('image/png'); // Store image to pass to cropper
          console.log('Image captured successfully:', this.croppedImage);
        } else {
          this.toaster.warning('Image capture aborted: Validation failed.');
        }
      }).catch((error) => {
        console.error('Validation failed, unable to capture image:', error);
      });
    
      // Trigger validation when video metadata is loaded
      video.onloadedmetadata = () => {
        this.startValidation();
      };
    }

// captureImage(): void {
//   if (!this.stream || !this.stream.active) {
//     this.toaster.error('Please enable the camera.', 'Error', {
//       positionClass: 'toast-bottom-center',
//       closeButton: true,
//       progressBar: true,
//     });
//     return;
//   }

//   const video = this.videoElement.nativeElement;
//   const canvas = this.canvasElement.nativeElement; // Use the existing canvas
//   const context = canvas.getContext('2d');

//   if (!context) {
//     this.toaster.error('Failed to capture the image.', 'Error');
//     return;
//   }

//   // Set canvas size to match the video
//   canvas.width = video.videoWidth || 640;
//   canvas.height = video.videoHeight || 480;

//   // Draw the full video frame on the canvas
//   context.drawImage(video, 0, 0, canvas.width, canvas.height);

//   // Convert the full canvas content to base64 string
//   const fullFrameBase64 = canvas.toDataURL('image/png');
//   console.log('Captured Full Frame Image: ', fullFrameBase64);

//   // Validate the captured image
//   this.startValidation()
//     .then((isValid) => {
//       console.log('Validation result:', isValid);
//       if (isValid) {
//         this.croppedImage = fullFrameBase64; // Store the full frame as base64
//         console.log('Image captured successfully:', this.croppedImage);
//       } else {
//         this.toaster.error('Image capture aborted: Validation failed.');
//       }
//     })
//     .catch((error) => {
//       console.error('Validation failed, unable to capture image:', error);
//     });
// }


  private validateCroppedImage(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.croppedImageBlob) {
        this.toaster.error('No cropped image available for validation.', 'Error');
        resolve(false);
        return;
      }
  
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
  
      if (!context) {
        this.toaster.error('Failed to get canvas context.', 'Error');
        resolve(false);
        return;
      }
  
      const reader = new FileReader();
      reader.readAsDataURL(this.croppedImageBlob);
      reader.onload = () => {
        const image = new Image();
        image.src = reader.result as string;
  
        image.onload = () => {
          canvas.width = image.width;
          canvas.height = image.height;
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
  
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  
          this.openCVService.processImage(imageData)
            .then((result) => {
              const { faceCorrect } = result;
              console.log('rrrr',result)
              if (!faceCorrect) {
                 this.toaster.warning('No valid face detected in the cropped image.', 'Validation Failed');
                resolve(false);
              } else {
                resolve(true);
              }
            })
            .catch((error) => {
              console.error('Error during cropped image validation:', error);
              this.toaster.error('Validation failed. Please try again.', 'Error');
              resolve(false);
            });
        };
  
        image.onerror = () => {
          this.toaster.error('Failed to load cropped image.', 'Error');
          resolve(false);
        };
      };
  
      reader.onerror = () => {
        this.toaster.error('Failed to read cropped image.', 'Error');
        resolve(false);
      };
    });
  }


  
  
  /**
   * Event called when the image is cropped
   */
  imageCropped(event: ImageCroppedEvent): void {
    if (event.blob) {
      this.croppedImageBlob = event.blob; // Get the blob
      this.croppedFile = new File([this.croppedImageBlob], 'cropped-image.png', { type: 'image/png' });

      // Convert Blob to Base64
      const reader = new FileReader();
      reader.readAsDataURL(this.croppedImageBlob); // Read blob as Base64
      reader.onloadend = async () => {
        this.croppedImageBase64 = reader.result as string; // Base64 encoded string
        console.log('Base64 Image after cropped:', this.croppedImageBase64.split(',')[1]); // Log the Base64 image string
  
        // Validate the cropped image
        const isValid = await this.validateCroppedImage();
        this.isCroppedValid=isValid
        console.log("iscroppedvalid",isValid)
        if (!isValid) {
          // this.toaster.warning('The cropped image does not meet the validation criteria. Please try again.', 'Validation Failed');
          this.croppedImageBlob = null;
          this.croppedFile = null;
          this.croppedImageBase64 = '';
          return;
        }
  
        this.toaster.success('Cropped image is valid.', 'Validation Passed');
        // Proceed with further actions (e.g., uploading the image)
      };
    }
  }
  
  

  stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null; // Clear the stream reference
      this.videoElement.nativeElement.srcObject = null; // Clear the video feed
    }
  }

  imageLoaded(event: any): void {
    console.log('Image loaded', event);
  }

  cropperReady(): void {
    console.log('Cropper is ready');
  }

  loadImageFailed(): void {
    console.error('Image failed to load');
  }

  ngOnDestroy(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
  }


  
}
