// reload a image tag with a new image of input file
// The input is with id image
// The image tag is with id imagePreview

const image = document.getElementById('image');
const imagePreview = document.getElementById('imagePreview');

image.addEventListener('change', (e) => {
    console.log(e.target.files[0]);
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        //Check if the image is a valid image
        if (file.type === 'image/jpeg' || file.type === 'image/png') {
            //Check if the image has a valid extension
            if (file.name.endsWith('.jpg') || file.name.endsWith('.jpeg') || file.name.endsWith('.png')) {
                imagePreview.src = reader.result;
            } else {
                imagePreview.src = 'https://via.placeholder.com/300x250?text=Extensión+no+permitida';
            }
        } else {
            imagePreview.src = 'https://via.placeholder.com/300x250?text=Formato+no+permitido';
        }
    }
});