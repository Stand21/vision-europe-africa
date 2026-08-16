'use client'
import { useRef, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Upload, Loader2, X, Image as ImageIcon } from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

/**
 * Champ visuel de l'administration : deux façons d'obtenir une image, au choix.
 *
 *  1. téléverser un fichier depuis l'ordinateur (affiche → devient une URL) ;
 *  2. coller une URL existante.
 *
 * L'aperçu s'affiche dans les deux cas, ce qui évite d'enregistrer une adresse
 * cassée sans s'en rendre compte.
 */
export function ImageField({
  value,
  onChange,
  token,
  label = 'Visuel',
  hint,
}: {
  value: string
  onChange: (url: string) => void
  token: string
  label?: string
  hint?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [broken, setBroken] = useState(false)

  const IMAGE_TYPES = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
    'image/svg+xml', 'image/avif', 'image/bmp', 'image/x-icon',
    'image/vnd.microsoft.icon', 'image/tiff',
  ]

  const upload = async (file: File) => {
    const isImage = file.type.startsWith('image/') || IMAGE_TYPES.includes(file.type)
    if (!isImage) {
      toast.error('Seules les images sont acceptées')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image trop lourde — 5 Mo maximum')
      return
    }

    const form = new FormData()
    form.append('image', file)
    setUploading(true)
    try {
      const { data } = await axios.post(`${API}/admin/uploads/image`, form, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setBroken(false)
      onChange(data.url)
      toast.success('Image téléversée ✔')
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Échec du téléversement')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs text-gray-400">{label}</label>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          value={value || ''}
          onChange={e => { setBroken(false); onChange(e.target.value) }}
          placeholder="Collez une URL, ou téléversez un fichier →"
          className="input-premium text-sm flex-1"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2.5 rounded-xl border border-white/20 text-gray-300 hover:text-white hover:border-gold-400 text-sm transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? 'Envoi…' : 'Téléverser'}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => { setBroken(false); onChange('') }}
            title="Retirer l'image"
            className="px-3 py-2.5 rounded-xl border border-white/20 text-gray-400 hover:text-red-400 hover:border-red-400/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,.avif,.bmp,.ico,.tif,.tiff"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) upload(f) }}
      />

      {hint && <p className="text-[11px] text-gray-500">{hint}</p>}

      {/* Aperçu : on voit tout de suite si l'adresse est cassée */}
      {value ? (
        broken ? (
          <div className="h-28 rounded-xl border border-dashed border-red-500/40 flex items-center justify-center text-xs text-red-400 gap-2">
            <ImageIcon className="w-4 h-4" /> Image introuvable à cette adresse
          </div>
        ) : (
          <img
            src={value}
            alt=""
            onError={() => setBroken(true)}
            className="h-28 w-full object-cover rounded-xl border border-white/10"
          />
        )
      ) : (
        <div className="h-28 rounded-xl border border-dashed border-white/15 flex items-center justify-center text-xs text-gray-500 gap-2">
          <ImageIcon className="w-4 h-4" /> Aucun visuel
        </div>
      )}
    </div>
  )
}
