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
 @ViewChild('canvas') canvasElement!: ElementRef<HTMLCanvasElement>;

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

 constructor(private toaster:ToastrService ,private openCVService:CameraService){}
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
          //this.startValidation();
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
  

  startValidation(): Promise<boolean> {
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');
  
    return new Promise((resolve, reject) => {
      if (!context) {
        this.toaster.error('Failed to get video context.', 'Error');
        reject(false);
        return;
      }
  
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
  
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      console.log("imagedata",imageData)
      this.openCVService.processImage(imageData)
        .then((result) => {
          console.log("result",result)
          const { faceCorrect, resolutionCorrect } = result;

          if (!faceCorrect) {
            this.toaster.warning(result.message);
            resolve(false);
          } 
          // else if (!resolutionCorrect) {
          //   this.toaster.warning('Camera resolution is too low. Use a higher-quality camera.', 'Resolution Warning');
          //   resolve(false);
          // } 
          
          else {
            this.toaster.success('Face detected successfully.', result.message);
            resolve(true);
          }
        })
        .catch((error) => {
          console.error('Error during validation:', error);
          this.toaster.error('Validation failed. Please try again.', 'Error');
          reject(false);
        });
    });
  }
  
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
   * Capture an image from the video stream and convert it to base64
   */
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
        console.warn('Image capture aborted: Validation failed.');
      }
    }).catch((error) => {
      console.error('Validation failed, unable to capture image:', error);
    });
  
    // Trigger validation when video metadata is loaded
    video.onloadedmetadata = () => {
      this.startValidation();
    };
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
