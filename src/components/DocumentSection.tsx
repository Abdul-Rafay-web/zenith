import React, { useRef, useState } from "react"
import type { AttachedDoc } from "../types"
import { Plus, Trash2, X } from "./icons"

interface DocumentSectionProps {
  title?: string
  description?: string
  documents: AttachedDoc[]
  onAddDocument: (doc: AttachedDoc) => void
  onRemoveDocument: (docId: string) => void
}

export default function DocumentSection({
  title = "Documents & Resources",
  description = "Attach PDFs, research papers, notes, or reference links.",
  documents = [],
  onAddDocument,
  onRemoveDocument,
}: DocumentSectionProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [docType, setDocType] = useState<"file" | "link">("file")
  const [linkUrl, setLinkUrl] = useState("")
  const [linkTitle, setLinkTitle] = useState("")
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    const reader = new FileReader()

    reader.onload = () => {
      const result = reader.result as string
      const sizeKb = Math.round(file.size / 1024)
      const sizeStr = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`

      const isPdf = file.name.toLowerCase().endsWith(".pdf") || file.type.includes("pdf")

      const newDoc: AttachedDoc = {
        id: crypto.randomUUID(),
        name: file.name,
        dataUrl: result,
        type: isPdf ? "pdf" : "doc",
        size: sizeStr,
        addedAt: new Date().toISOString(),
      }

      onAddDocument(newDoc)
      setUploading(false)
      setModalOpen(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }

    reader.onerror = () => {
      setUploading(false)
      alert("Could not read file. Please try another document.")
    }

    reader.readAsDataURL(file)
  }

  function handleAddLink(e: React.FormEvent) {
    e.preventDefault()
    if (!linkUrl.trim()) return

    let formattedUrl = linkUrl.trim()
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = `https://${formattedUrl}`
    }

    const name = linkTitle.trim() || new URL(formattedUrl).hostname

    const newDoc: AttachedDoc = {
      id: crypto.randomUUID(),
      name,
      url: formattedUrl,
      type: "link",
      addedAt: new Date().toISOString(),
    }

    onAddDocument(newDoc)
    setLinkUrl("")
    setLinkTitle("")
    setModalOpen(false)
  }

  function openDocument(doc: AttachedDoc) {
    if (doc.url) {
      window.open(doc.url, "_blank", "noopener,noreferrer")
    } else if (doc.dataUrl) {
      const win = window.open()
      if (win) {
        win.document.write(
          `<iframe src="${doc.dataUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
        )
      } else {
        const downloadLink = document.createElement("a")
        downloadLink.href = doc.dataUrl
        downloadLink.download = doc.name
        downloadLink.click()
      }
    }
  }

  return (
    <div className="doc-section">
      <div className="doc-section-header">
        <div>
          <h4>{title}</h4>
          <p>{description}</p>
        </div>
        <button
          type="button"
          className="mini-add-button"
          onClick={() => setModalOpen(true)}
        >
          <Plus size={15} /> Add Document
        </button>
      </div>

      {documents.length === 0 ? (
        <div className="doc-empty-state">
          <span>No documents or resources attached yet.</span>
        </div>
      ) : (
        <div className="doc-list">
          {documents.map((doc) => (
            <div key={doc.id} className="doc-item">
              <div
                className="doc-info"
                onClick={() => openDocument(doc)}
                role="button"
                tabIndex={0}
              >
                <span className={`doc-icon-badge ${doc.type}`}>
                  {doc.type === "pdf" ? "PDF" : doc.type === "link" ? "LINK" : "DOC"}
                </span>
                <div className="doc-meta">
                  <strong className="doc-name">{doc.name}</strong>
                  {doc.size && <small className="doc-size">{doc.size}</small>}
                </div>
              </div>
              <button
                type="button"
                className="doc-delete-btn"
                aria-label={`Remove ${doc.name}`}
                onClick={(e) => {
                  e.stopPropagation()
                  onRemoveDocument(doc.id)
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div
          className="sheet-backdrop"
          onClick={() => setModalOpen(false)}
          role="presentation"
        >
          <section
            className="sheet doc-modal"
            role="dialog"
            aria-labelledby="doc-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sheet-handle" />
            <button
              type="button"
              className="sheet-close"
              aria-label="Close"
              onClick={() => setModalOpen(false)}
            >
              <X size={19} />
            </button>

            <h2 id="doc-modal-title">Attach Document or Resource</h2>
            <p className="doc-modal-desc">
              Upload PDF files, cheat sheets, lab work, or save web resources.
            </p>

            <div className="doc-tab-toggle">
              <button
                type="button"
                className={docType === "file" ? "active" : ""}
                onClick={() => setDocType("file")}
              >
                Upload File (PDF / Doc)
              </button>
              <button
                type="button"
                className={docType === "link" ? "active" : ""}
                onClick={() => setDocType("link")}
              >
                Web Resource Link
              </button>
            </div>

            {docType === "file" ? (
              <div className="file-upload-area">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf,.doc,.docx,.txt,application/pdf"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
                <div className="upload-prompt">
                  <strong>{uploading ? "Attaching file..." : "Choose a PDF or Document"}</strong>
                  <small>Supports PDF, DOC, DOCX, TXT</small>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAddLink} className="link-form">
                <label>
                  <span>DOCUMENT TITLE (OPTIONAL):</span>
                  <input
                    type="text"
                    value={linkTitle}
                    onChange={(e) => setLinkTitle(e.target.value)}
                    placeholder="e.g. Research Protocol Paper, Syllabus"
                  />
                </label>
                <label>
                  <span>RESOURCE URL:</span>
                  <input
                    type="text"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://..."
                    required
                  />
                </label>
                <button type="submit" className="primary-button sheet-submit">
                  Save Resource Link
                </button>
              </form>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
