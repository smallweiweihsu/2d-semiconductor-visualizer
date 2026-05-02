import type { LiteratureSource } from '../types/literature'

const placeholderNote = '此為待補文獻占位資料，尚未填入真實 DOI 或數值。'

export const literatureSources: LiteratureSource[] = [
  {
    id: 'lit-in-sb2o3-buffer-placeholder',
    title: '待補：In / Sb₂O₃ interface buffer paper',
    sourceType: 'unknown',
    reviewStatus: 'candidate',
    notes_zh: placeholderNote,
    tags_zh: ['In', 'Sb₂O₃', 'interface buffer', '待補'],
  },
  {
    id: 'lit-sb2o3-dielectric-placeholder',
    title: '待補：Sb₂O₃ dielectric constant source',
    sourceType: 'unknown',
    reviewStatus: 'candidate',
    notes_zh: placeholderNote,
    tags_zh: ['Sb₂O₃', '介電常數', '待補'],
  },
  {
    id: 'lit-pd-wse2-contact-placeholder',
    title: '待補：Pd / WSe₂ contact behavior source',
    sourceType: 'unknown',
    reviewStatus: 'candidate',
    notes_zh: placeholderNote,
    tags_zh: ['Pd', 'WSe₂', 'contact', 'pinning', '待補'],
  },
  {
    id: 'lit-wse2-wox-oxidation-placeholder',
    title: '待補：WSe₂ oxidation to WOx source',
    sourceType: 'unknown',
    reviewStatus: 'candidate',
    notes_zh: placeholderNote,
    tags_zh: ['WSe₂', 'WOx', '氧化', '待補'],
  },
  {
    id: 'lit-raman-visible-oxidation-placeholder',
    title: '待補：Raman visibility after oxidation source',
    sourceType: 'unknown',
    reviewStatus: 'candidate',
    notes_zh: placeholderNote,
    tags_zh: ['Raman', '氧化後可見性', '待補'],
  },
  {
    id: 'lit-metal-diffusion-sb2o3-placeholder',
    title: '待補：metal diffusion into Sb₂O₃ source',
    sourceType: 'unknown',
    reviewStatus: 'candidate',
    notes_zh: placeholderNote,
    tags_zh: ['金屬擴散', 'Sb₂O₃', 'D0', 'Ea', '待補'],
  },
]
