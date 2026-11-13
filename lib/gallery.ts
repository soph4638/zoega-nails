// -----------------------------------------------------------------------
// Galleri-billeder
// -----------------------------------------------------------------------
// Billederne ligger i /public/images/gallery. Sådan tilføjer/ændrer du dem:
//   1. Læg dit billede i mappen /public/images/gallery (fx "negle-18.jpg").
//   2. Tilføj en ny linje herunder med "src" som filstien og en kort "alt"-beskrivelse.
//   3. Vil du fjerne et billede, sletter du bare linjen (og gerne filen i mappen).
// -----------------------------------------------------------------------

export type GalleryImage = {
  src: string;
  alt: string;
};

// De nyeste billeder står øverst, så de vises først i galleriet.
export const galleryImages: GalleryImage[] = [
  { src: "/images/gallery/negle-22.jpg", alt: "Lyserøde negle med håndmalede pink blomster" },
  { src: "/images/gallery/negle-21.jpg", alt: "Nude mandelnegle med håndmalede hvide hibiscus-blomster og prikker" },
  { src: "/images/gallery/negle-20.jpg", alt: "Mælkehvide negle med 3D-blomster, marmor og små guldperler" },
  { src: "/images/gallery/negle-19.jpg", alt: "Klassisk fransk manicure med lyserød 3D-blomst" },
  { src: "/images/gallery/negle-18.jpg", alt: "Nude negle med ternet fransk spids" },
  { src: "/images/gallery/negle-1.jpg", alt: "Mandelformede negle med ternet Burberry-inspireret spids" },
  { src: "/images/gallery/negle-2.jpg", alt: "Negle med leopard- og tigerprint samt guld-detaljer" },
  { src: "/images/gallery/negle-3.jpg", alt: "Lyserøde negle med prikker og gulddetaljer" },
  { src: "/images/gallery/negle-4.jpg", alt: "Klassisk fransk manicure med hvid spids" },
  { src: "/images/gallery/negle-5.jpg", alt: "Hvide og beige negle med prikker og 3D-blomst" },
  { src: "/images/gallery/negle-6.jpg", alt: "Nude negle med hvide prikker og striber" },
  { src: "/images/gallery/negle-7.jpg", alt: "Fransk manicure med håndmalede hvide blomster" },
  { src: "/images/gallery/negle-8.jpg", alt: "Nude negle med håndmalet lyserødt blomsterdesign" },
  { src: "/images/gallery/negle-9.jpg", alt: "Sort-hvide negle med prikker og fransk spids" },
  { src: "/images/gallery/negle-10.jpg", alt: "Negle med orange-sort tigerstribet spids" },
  { src: "/images/gallery/negle-11.jpg", alt: "Mintgrønne negle med tigerstriber og håndmalet tiger" },
  { src: "/images/gallery/negle-12.jpg", alt: "Fransk manicure med lyserødt hjertemønster" },
  { src: "/images/gallery/negle-13.jpg", alt: "Fransk manicure med fint 3D-blomsterdesign" },
  { src: "/images/gallery/negle-14.jpg", alt: "Negle med lyserøde striber og stjernemønster" },
  { src: "/images/gallery/negle-15.jpg", alt: "Nude negle med 3D-muslingedetaljer og guld" },
  { src: "/images/gallery/negle-16.jpg", alt: "Negle med hvid spids og sorte prikker" },
  { src: "/images/gallery/negle-17.jpg", alt: "Mælkehvide negle med gyldne bladdetaljer" },
];

// Hent et billede ud fra filnavnet, fx getGalleryImage("negle-19.jpg")
export function getGalleryImage(fileName: string): GalleryImage {
  return (
    galleryImages.find((image) => image.src.endsWith(`/${fileName}`)) ?? galleryImages[0]
  );
}
