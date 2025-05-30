# Photo Booth app tutorial 🚀

**Description:**

For this tutorial we will be using [Vite](https://vitejs.dev/), vite is a development tool that allows us to have almost zero configuration and start coding rigth away.
We will cover some known javascript events to build this app. 

I hope you enjoy it 🖤

## Pre-requisites 👩‍💻 👨‍💻

1. Install [VSCode](https://code.visualstudio.com/download) 
2. Install [NodeJS](https://nodejs.org/en)

## Let's build our app!!! 📷

### Step 1: Create a Vanilla JS App using Vite ⌨️

1. Open a terminal and go to your preferred folder
2. Run the following command: `npm create vite@latest`
3. Select the following options:
4. ![image](https://github.com/orientedev/photo-booth/assets/26145998/2dc66a54-2ca4-4557-8cf8-ecfc5fa6b710)
5. Go to `photo-booth` folder and run: `npm install`
6. Once the installation is completed, lets run: `npm run dev`
7. Go to: [localhost](http://localhost:5173/)
8. If eveything went well, you should be able to see the following screen:
9. ![image](https://github.com/orientedev/photo-booth/assets/26145998/5b808ec6-3edd-4154-bb1f-db69cbc763ac)

### Step 2: Clean up current vite app 👩‍💻

1. Open the photo-booth app folder in Visual studio code.
2. Go to `index.html`
3. Change the title tag to: `Photo Booth - oriente.dev`
4. Remove the following div: `<div id="app"></div>`
5. Go to `main.js` and Clear all the content from it
7. Go to `style.css` and clear all the content from it

### Step 3: Add all necessary HTML Markup 📓

We will have a section to wrap our photo booth app, and 4 more sections inside. Lets' break them in different items so we can go through all of them:

0. Go to `index.html`
1. Add a new section above the script tag: `<section class="app-container"></section>`
2. Inside of the `app-container` sections, lets add a new tag for the app title: `<h1>Photo Booth oriente.dev</h1>`
3. Then, lets add the video container with the button that will help us see our camera and take a photo of ourselves: 
``` html
      <section class="video-container">
        <video id="video" autoplay></video>

        <div class="button-container">
          <button id="capture-btn">Snap!</button>
        </div>
      </section>
```
4. Now, we will add an empty section to append all images that we will be taking:
``` html
      <section id="images-container">
        <!-- Images are rendered here -->
      </section>
```
5. And last but not least, we will be adding a hidden canvan element, that will allow us to actually create an image out of the video that it's streaming from the camera.
``` html
      <!-- not displayed in the web page -->
      <canvas
        id="canvas"
        width="640"
        height="480"
        style="display: none"
      ></canvas>
```
The result that we should be getting now is the following page: 

![image](https://github.com/orientedev/photo-booth/assets/26145998/6cbdd29b-70a0-4005-8b7b-0db889eb687f)

Hint: Here's the entire HTML file, just in case you migth be missing something: 

``` html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Photo Booth - oriente.dev</title>
  </head>
  <body>
    <section class="app-container">
      <h1>Photo Booth oriente.dev</h1>

      <section class="video-container">
        <video id="video" autoplay></video>

        <div class="button-container">
          <button id="capture-btn">Snap!</button>
        </div>
      </section>

      <section id="images-container">
        <!-- Images are rendered here -->
      </section>

      <!-- not displayed in the web page -->
      <canvas
        id="canvas"
        width="640"
        height="480"
        style="display: none"
      ></canvas>
    </section>

    <script type="module" src="/main.js"></script>
  </body>
</html>
```

### Step 4: Lets add our first events and all Javascript code, where the magic happens! ✨

0. Go to `main.js`
1. We will need to create 4 constants and access our DOM elements from there. To do that in the root of the main folder we will add the following code:
``` javascript
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const captureButton = document.getElementById("capture-btn");
const imagesContainer = document.getElementById("images-container");
```

2. We will add ours first event which is `DOMContentLoaded`, which basically gets executed when the DOM finished loading all of the HTML elements. Here's how we will add the event listener:
``` javascript
async function initCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
  } catch (err) {
    console.error("Error accessing the camera: ", err);
  }
}

// Initialize camera when the page loads
window.addEventListener("DOMContentLoaded", initCamera);

```
Once we do this, we should be able to go to our page and see the following: 

<img width="850" alt="image" src="https://github.com/orientedev/photo-booth/assets/26145998/2e3cd908-046a-42aa-a15c-85eb2da8537c">

3. Now, we will add a new event to the button, to actually take a photo out of the video that's currently streaming. To do so, we need to use the canvas and create a new Image element that we will append to the view.

``` javascript
// Capture image when the button is clicked
captureButton.addEventListener("click", captureImage);

// Capture a still image
function captureImage() {
  const context = canvas.getContext("2d");

  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Convert canvas to image
  const imgData = canvas.toDataURL("image/png");

  // Display image
  const capturedImage = new Image();
  capturedImage.src = imgData;
  capturedImage.width = "200";
  capturedImage.height = "150";

  imagesContainer.prepend(capturedImage);
}
```

I will explain above code more in details in our meetup practical session. but what we are doing is that we are taking an screenshot of the video using the canvas context and then transforming that to a image in data format.
Then we create an HTML tag by using the `new Image()` constructor, and finally we are appending the new image to the `imagesContainer` section.

4. If you go to our localhost web page, and see the video, then click on the button called: "Snap", you should see something like this:
<img width="1524" alt="image" src="https://github.com/orientedev/photo-booth/assets/26145998/c8d19d1e-58f1-4feb-bdf2-a13232540f62">


Now, we have seen how to add interactivity to a web page using javascript, we can see how powerful javascript is, and what it allows us to do using events. We only covered 2 events and now we were able to build a photo booth app, just as simple as it looks like.

Here's the MDN documentation to check more events: [MDN Events](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events)

### Step 5: Add some styles 💅

We have a decent application so far, but it looks a little bit uggly. So we want to add some styles to it.

1. Go to `main.js` and add import the style file `import "./style.css";` stylesheet.

2. Go to `style.css` file and add the following styles: 

``` css
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  background-color: #212121;
  color: white;
}

h1 {
  font-size: 50px;
  text-align: center;
}

.app-container {
  display: flex;
  flex-flow: column;
  margin: 0 auto;
  max-width: 768px;
  align-items: center;
}

.video-container {
  border-radius: 16px;
  width: 440px;
  border: 2px solid white;
}

.video-container > video {
  height: 327px;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
}

.button-container {
  width: 100%;
  border-top: 2px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.button-container > button {
  background: #474747;
  border: none;
  cursor: pointer;
  color: white;
  font-size: 24px;
  width: 100%;
  padding: 8px;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
}

#images-container {
  display: flex;
  flex-flow: row;
  gap: 8px;
  border: 2px solid white;
  min-height: 150px;
  width: 440px;
  margin: 40px 0;
  overflow-x: auto;
  padding: 8px;
}

#images-container::-webkit-scrollbar {
  display: none;
}

```

Note: I won't take a lot of time explaining what every line of css does, but I will go through some of them in our meetup.


Here's the final result of our app: 

<img width="827" alt="image" src="https://github.com/orientedev/photo-booth/assets/26145998/5d72edef-c7c1-4eb5-8047-9c56cf908bed">

Thanks for bearing with us, stay tuned for future content.


#   p h o t o b o o t h - a p p  
 