import fitz
import io
from PIL import Image

pdf_path = r'C:\Users\olive\Downloads\RaceMind_AI_LinkedIn_EXACT_Carousel(1).pdf'
doc = fitz.open(pdf_path)

output_dir = r'apps\website\public\features'

for page_index in range(len(doc)):
    page = doc[page_index]
    image_list = page.get_images()
    
    # If the page itself is an image or contains an image
    if image_list:
        for image_index, img in enumerate(image_list, start=1):
            xref = img[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            image_ext = base_image["ext"]
            
            image_filename = f"{output_dir}\\page_{page_index+1}_img_{image_index}.{image_ext}"
            with open(image_filename, "wb") as f:
                f.write(image_bytes)
            print(f"Extracted {image_filename}")
    else:
        # Render the page as an image if it's vector
        pix = page.get_pixmap(dpi=300)
        image_filename = f"{output_dir}\\page_{page_index+1}_render.png"
        pix.save(image_filename)
        print(f"Rendered {image_filename}")
