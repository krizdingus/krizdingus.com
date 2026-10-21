// A credit line written into the pictures the scripts make (EXIF Artist,
// plus XMP dc:creator, photoshop:Credit and dc:source) so a saved or shared
// copy still says where it came from. It's attribution, not a rights claim.
// Every other piece of metadata is still dropped: sharp only writes what's
// passed here.
//
//   import { withCredit } from './image-credit.mjs';
//   await withCredit(sharp(input).resize(...)).webp(...).toFile(out);
export const CREDIT = 'Stolen from Kris Williams at krizdingus.com';
export const SOURCE = 'https://krizdingus.com';

const XMP = `<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:photoshop="http://ns.adobe.com/photoshop/1.0/"><dc:creator><rdf:Seq><rdf:li>${CREDIT}</rdf:li></rdf:Seq></dc:creator><photoshop:Credit>${CREDIT}</photoshop:Credit><dc:source>${SOURCE}</dc:source></rdf:Description></rdf:RDF></x:xmpmeta>`;

export function withCredit(pipeline) {
  return pipeline.withExif({ IFD0: { Artist: CREDIT } }).withXmp(XMP);
}
