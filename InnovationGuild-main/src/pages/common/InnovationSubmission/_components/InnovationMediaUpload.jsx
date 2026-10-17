import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

// File validation constants
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm'];

// Document validation constants
const MAX_DOCUMENT_TOTAL_SIZE = 20 * 1024 * 1024; // 20MB combined
const MAX_DOCUMENT_COUNT = 5; // Max 5 documents
const ACCEPTED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/vnd.ms-powerpoint', // .ppt
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.ms-excel', // .xls
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // .xlsx
];

// Media upload limits
const MAX_UPLOADED_VIDEOS = 2; // Max 2 uploaded video files

// Helper to check if file is duplicate
const isDuplicateFile = (file, existingItems) => {
  return existingItems.some(item => {
    const existingFile = item.file;
    if (!existingFile) return false; // URL-type items have no .file property
    return existingFile.name === file.name &&
           existingFile.size === file.size &&
           existingFile.lastModified === file.lastModified;
  });
};

// Helper to check if URL is duplicate
const isDuplicateUrl = (url, existingItems) => {
  return existingItems.some(item => {
    if (item.type !== 'url') return false;
    return item.url.trim().toLowerCase() === url.trim().toLowerCase();
  });
};

const InnovationMediaUpload = ({
  mediaItems = [],
  otherDocuments,
  onMediaItemsChange,
  onOtherDocumentsChange
}) => {
  // Ref to always hold latest mediaItems for cleanup on unmount
  const mediaItemsRef = useRef(mediaItems);
  useEffect(() => {
    mediaItemsRef.current = mediaItems;
  }, [mediaItems]);

  // --- UI STATE ---
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
  const [touchStartIndex, setTouchStartIndex] = useState(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');

  // 1. Reset active index if it becomes invalid (e.g. after deletion)
  useEffect(() => {
    if (activeImageIndex >= mediaItems.length && mediaItems.length > 0) {
      setActiveImageIndex(mediaItems.length - 1);
    } else if (mediaItems.length === 0) {
      setActiveImageIndex(0);
    }
  }, [mediaItems.length, activeImageIndex]);

  // 2. Cleanup Object URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      mediaItemsRef.current.forEach(item => {
        if (item.type === 'file' && item.url) {
          URL.revokeObjectURL(item.url);
        }
      });
    };
  }, []);

  // --- HANDLERS ---

  const handlePromoFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = 5 - mediaItems.length;

    if (remainingSlots <= 0) {
      toast.error("You can only upload a maximum of 5 media items.");
      return;
    }

    // Count currently uploaded videos (not URLs)
    const currentUploadedVideos = mediaItems.filter(item => item.fileType === 'video' && item.type !== 'url').length;

    const validFiles = [];
    const errors = [];
    let uploadedVideoCount = currentUploadedVideos;

    for (const file of files.slice(0, remainingSlots)) {
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');

      // Check for duplicate BEFORE other validations (include current batch)
      if (isDuplicateFile(file, [...mediaItems, ...validFiles])) {
        errors.push(`${file.name}: This file has already been uploaded`);
        continue;
      }

      // Check uploaded video limit BEFORE processing
      if (isVideo && uploadedVideoCount >= MAX_UPLOADED_VIDEOS) {
        errors.push(`${file.name}: Maximum ${MAX_UPLOADED_VIDEOS} uploaded videos allowed. Use YouTube/Vimeo links for additional videos.`);
        continue;
      }

      // Validate file type
      if (isVideo && !ACCEPTED_VIDEO_TYPES.includes(file.type)) {
        errors.push(`${file.name}: Only MP4 and WebM videos are supported`);
        continue;
      }
      if (isImage && !ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        errors.push(`${file.name}: Only JPG, PNG, and WebP images are supported`);
        continue;
      }
      if (!isVideo && !isImage) {
        errors.push(`${file.name}: Only images and videos are supported`);
        continue;
      }

      // Validate file size
      const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
      if (file.size > maxSize) {
        const maxSizeMB = maxSize / (1024 * 1024);
        errors.push(`${file.name}: File size exceeds ${maxSizeMB}MB limit`);
        continue;
      }

      validFiles.push({
        type: 'file',
        fileType: isVideo ? 'video' : 'image',
        url: URL.createObjectURL(file),
        file: file,
        name: file.name,
        id: Date.now() + Math.random()
      });

      // Increment counter if video
      if (isVideo) uploadedVideoCount++;
    }

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
    }

    if (validFiles.length > 0) {
      onMediaItemsChange([...mediaItems, ...validFiles]);
      toast.success(`${validFiles.length} file(s) uploaded successfully`);
    }

    e.target.value = '';
  };

  const handleAddVideoUrl = () => {
    if (!videoUrl.trim()) return;

    // Check for duplicate URLs (case-insensitive)
    if (isDuplicateUrl(videoUrl, mediaItems)) {
      toast.error("This video URL has already been added");
      return;
    }

    if (mediaItems.length >= 5) {
      toast.error("You can only upload a maximum of 5 media items.");
      return;
    }

    // Validate URL format
    let validUrl;
    try {
      validUrl = new URL(videoUrl.trim());
    } catch {
      toast.error("Please enter a valid URL (e.g., https://youtube.com/watch?v=...)");
      return;
    }

    // Validate supported video platforms (prevent hostname spoofing)
    const hostname = validUrl.hostname.toLowerCase();
    const isYouTube = hostname === 'youtube.com' || hostname === 'www.youtube.com' || hostname === 'youtu.be' || hostname === 'www.youtu.be';
    const isVimeo = hostname === 'vimeo.com' || hostname === 'www.vimeo.com' || hostname === 'player.vimeo.com';
    const isDirectVideo = /\.(mp4|webm)$/i.test(validUrl.pathname);

    const isSupported = isYouTube || isVimeo || isDirectVideo;

    if (!isSupported) {
      toast.error("Please enter a YouTube, Vimeo, or direct video file URL (.mp4, .webm)");
      return;
    }

    onMediaItemsChange([...mediaItems, {
      type: 'url',
      url: videoUrl.trim(),
      name: 'Video Link',
      id: Date.now() + Math.random()
    }]);

    setVideoUrl('');
    setShowUrlInput(false);
    toast.success("Video URL added!");
  };

  const handleRemoveItem = (indexToRemove) => {
    const itemToRemove = mediaItems[indexToRemove];

    // Revoke Object URL to prevent memory leak
    if (itemToRemove.type === 'file' && itemToRemove.url) {
      URL.revokeObjectURL(itemToRemove.url);
    }

    const newItems = mediaItems.filter((_, idx) => idx !== indexToRemove);
    onMediaItemsChange(newItems);
  };

  const handleDocUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const currentDocs = Array.isArray(otherDocuments) ? otherDocuments : [];

    // Check document count limit
    if (currentDocs.length >= MAX_DOCUMENT_COUNT) {
      toast.error(`Maximum ${MAX_DOCUMENT_COUNT} documents allowed.`);
      return;
    }

    const remainingSlots = MAX_DOCUMENT_COUNT - currentDocs.length;
    const currentTotalSize = currentDocs.reduce((sum, doc) => sum + doc.size, 0);

    const validFiles = [];
    const errors = [];

    for (const file of files.slice(0, remainingSlots)) {
      // Check for duplicate documents (include current batch)
      if (isDuplicateFile(file, [...currentDocs, ...validFiles])) {
        errors.push(`${file.name}: This document has already been uploaded`);
        continue;
      }

      // Validate file type
      if (!ACCEPTED_DOCUMENT_TYPES.includes(file.type)) {
        errors.push(`${file.name}: Only PDF, PPT, PPTX, DOC, DOCX, XLS, XLSX files are supported`);
        continue;
      }

      // Check if adding this file would exceed total limit
      const newTotalSize = currentTotalSize + validFiles.reduce((sum, f) => sum + f.size, 0) + file.size;
      if (newTotalSize > MAX_DOCUMENT_TOTAL_SIZE) {
        const remainingMB = ((MAX_DOCUMENT_TOTAL_SIZE - currentTotalSize - validFiles.reduce((sum, f) => sum + f.size, 0)) / (1024 * 1024)).toFixed(1);
        errors.push(`${file.name}: Exceeds total document size limit. ${remainingMB}MB remaining.`);
        continue;
      }

      validFiles.push({
        file: file,
        name: file.name,
        size: file.size,
        id: Date.now() + Math.random()
      });
    }

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
    }

    if (validFiles.length > 0) {
      onOtherDocumentsChange([...currentDocs, ...validFiles]);
      toast.success(`${validFiles.length} document(s) uploaded successfully`);
    }

    if (files.length > remainingSlots) {
      toast.error(`Only ${remainingSlots} more document(s) can be uploaded (max ${MAX_DOCUMENT_COUNT} total).`);
    }

    e.target.value = '';
  };

  const handleRemoveDocument = (idToRemove) => {
    const currentDocs = Array.isArray(otherDocuments) ? otherDocuments : [];
    const newDocs = currentDocs.filter(doc => doc.id !== idToRemove);
    onOtherDocumentsChange(newDocs.length > 0 ? newDocs : []);
    toast.success("Document removed");
  };

  const getTotalDocSize = () => {
    const currentDocs = Array.isArray(otherDocuments) ? otherDocuments : [];
    return currentDocs.reduce((sum, doc) => sum + doc.size, 0);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // --- DRAG & DROP (DESKTOP) ---
  const handleDragStart = (index) => setDraggedItemIndex(index);

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index) return;
    reorderItems(draggedItemIndex, index);
    setDraggedItemIndex(index);
  };

  const handleDragEnd = () => setDraggedItemIndex(null);

  // --- TOUCH HANDLERS (MOBILE) ---
  const handleTouchStart = (index) => setTouchStartIndex(index);
  const handleTouchMove = (e) => {
    // Prevent scrolling while dragging
    if (touchStartIndex !== null) {
      e.preventDefault();
    }
  };
  const handleTouchEnd = (index) => {
    if (touchStartIndex !== null && touchStartIndex !== index) {
      reorderItems(touchStartIndex, index);
    }
    setTouchStartIndex(null);
  };

  // Shared Reorder Logic
  const reorderItems = (fromIndex, toIndex) => {
    const newItems = [...mediaItems];
    const draggedItem = newItems[fromIndex];
    newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, draggedItem);
    onMediaItemsChange(newItems);

    // Sync active index so the view doesn't jump
    if (activeImageIndex === fromIndex) {
      setActiveImageIndex(toIndex);
    } else if (fromIndex < activeImageIndex && toIndex >= activeImageIndex) {
      setActiveImageIndex(activeImageIndex - 1);
    } else if (fromIndex > activeImageIndex && toIndex <= activeImageIndex) {
      setActiveImageIndex(activeImageIndex + 1);
    }
  };

  // --- NAVIGATION ---
  const handlePrevImage = () => {
    setActiveImageIndex(prev => (prev === 0 ? mediaItems.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex(prev => (prev === mediaItems.length - 1 ? 0 : prev + 1));
  };

  // --- HELPERS ---
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  const isVideoUrl = (url) => {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com') || url.match(/\.(mp4|webm|ogg)$/i);
  };

  const activeItem = mediaItems[activeImageIndex];

  return (
    <div className="form-section">
      <div className="form-section-header">Uploads</div>
      <div className="space-y-6 sm:space-y-8">
        <p className="text-sm sm:text-base text-dark font-body">
          Upload at least 1 image and up to 2 videos (max. 5 total items including URLs) to showcase your Innovation. Videos can be up to 100MB each. You can also add YouTube/Vimeo URLs. Drag to reorder your media items.
        </p>

        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">

          {/* LEFT COLUMN: Upload Controls */}
          <div className="flex-1 flex flex-col gap-6">
            <div className="p-6 sm:p-8 lg:p-12 border-2 border-dashed border-accent-green-dark rounded-xl sm:rounded-2xl text-center bg-light flex flex-col items-center justify-center min-h-[300px]">
              
              {!showUrlInput ? (
                <>
                  <input
                    type="file"
                    id="photosUpload"
                    className="hidden"
                    onChange={handlePromoFileUpload}
                    accept="image/jpeg,image/jpg,image/png,image/webp,video/mp4,video/webm"
                    multiple
                    disabled={mediaItems.length >= 5}
                  />
                  <label htmlFor="photosUpload" className={`cursor-pointer flex flex-col items-center w-full justify-center ${mediaItems.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-placeholder w-8 h-8 sm:w-10 sm:h-10 mb-4">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="12" y1="18" x2="12" y2="12"></line>
                      <line x1="9" y1="15" x2="15" y2="15"></line>
                    </svg>
                    <p className="text-sm sm:text-base text-placeholder mb-5 font-body">
                      {mediaItems.length >= 5 ? 'Maximum 5 items reached' : (<>Drag and drop your files here or <label htmlFor="photosUpload" className="text-accent-green-dark underline cursor-pointer">choose</label></>)}
                    </p>
                    <div className={`px-8 py-3 bg-button-dark text-white text-sm sm:text-base lg:text-lg rounded-xl transition-colors font-medium border border-accent-green font-heading ${mediaItems.length >= 5 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-accent-green-dark'}`}>
                      Upload Media
                    </div>
                  </label>
                  {mediaItems.length < 5 && (
                    <div className="mt-4">
                      <button type="button" onClick={() => setShowUrlInput(true)} className="text-sm text-accent-green-dark underline hover:text-accent-green font-body cursor-pointer">+ Add Video URL</button>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full max-w-xs">
                  <label className="block text-sm text-left mb-2 text-dark font-medium font-body">Add Video Link</label>
                  <input type="url" className="w-full p-3 border border-accent-green-dark rounded-lg mb-3 text-sm  font-body" placeholder="https://youtube.com/..." value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddVideoUrl()} />
                  <div className="flex gap-2">
                    <button type="button" onClick={handleAddVideoUrl} className="flex-1 bg-button-dark text-white py-2 rounded-lg text-sm hover:bg-accent-green-dark transition-colors font-heading cursor-pointer">Add</button>
                    <button type="button" onClick={() => { setShowUrlInput(false); setVideoUrl(''); }} className="flex-1 bg-light text-dark py-2 rounded-lg text-sm hover:bg-header transition-colors border border-accent-green-dark font-heading cursor-pointer">Cancel</button>
                  </div>
                </div>
              )}

              {mediaItems.length > 0 && (
                <p className="mt-4 text-xs sm:text-sm text-accent-green-dark font-medium font-body">{mediaItems.length} / 5 items added</p>
              )}
            </div>

            <div className="text-sm sm:text-base text-placeholder italic font-body">
              <p className="mb-1">NOTE: Suggestive guidelines for the innovator on uploading videos.</p>
              <ol className="list-decimal list-inside space-y-1 pl-1">
                <li>Please ensure you cover the critical aspects of your innovation (assembly, installation, usage, benefits).</li>
                <li>Keep the video length up to 5 minutes.</li>
                <li>Ensure audio explanations have no background noise.</li>
              </ol>
            </div>
          </div>

          {/* RIGHT COLUMN: Preview Carousel */}
          <div className="flex-1 space-y-4">
            {mediaItems.length > 0 ? (
              <>
                {/* Main Large Preview */}
                <div className="w-full h-64 sm:h-80 lg:h-96 bg-gray-100 rounded-xl sm:rounded-2xl overflow-hidden relative border border-accent-green-dark">
                  {activeItem?.type === 'url' ? (
                    getYouTubeEmbedUrl(activeItem.url) ? (
                      <iframe key={activeItem.id} src={getYouTubeEmbedUrl(activeItem.url)} title="Video" className="w-full h-full" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                    ) : isVideoUrl(activeItem.url) ? (
                      <video key={activeItem.id} src={activeItem.url} controls className="w-full h-full object-cover bg-black" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-black text-white p-4">
                        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="5 3 19 12 5 21 5 3"/>
                          </svg>
                        </div>
                        <span className="text-sm truncate max-w-full px-4 font-body">{activeItem.url}</span>
                      </div>
                    )
                  ) : activeItem?.fileType === 'video' ? (
                    <video key={activeItem.id} src={activeItem.url} controls className="w-full h-full object-cover bg-black" />
                  ) : activeItem?.url ? (
                    <img key={activeItem.id} src={activeItem.url} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-placeholder"><p className="font-body">Image unavailable</p></div>
                  )}

                  {/* Delete Button */}
                  <button type="button" onClick={() => handleRemoveItem(activeImageIndex)} className="absolute top-3 right-3 bg-accent-green-dark text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg z-10 cursor-pointer" title="Remove this item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>

                  {/* Nav Arrows */}
                  {mediaItems.length > 1 && (
                    <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
                      <button type="button" className="pointer-events-auto bg-white/80 p-2 rounded-full hover:bg-white text-dark shadow-sm transition-transform hover:scale-110 cursor-pointer" onClick={handlePrevImage} aria-label="Previous">&#8249;</button>
                      <button type="button" className="pointer-events-auto bg-white/80 p-2 rounded-full hover:bg-white text-dark shadow-sm transition-transform hover:scale-110 cursor-pointer" onClick={handleNextImage} aria-label="Next">&#8250;</button>
                    </div>
                  )}
                </div>

                {/* Draggable Thumbnails List */}
                <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {mediaItems.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDragEnd={handleDragEnd}
                      onTouchStart={() => handleTouchStart(idx)}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={() => handleTouchEnd(idx)}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`
                        flex-shrink-0 w-20 h-14 sm:w-24 sm:h-16 lg:w-28 lg:h-20
                        rounded-lg cursor-grab active:cursor-grabbing overflow-hidden border-2 transition-all relative group
                        ${activeImageIndex === idx ? 'border-accent-green ring-2 ring-accent-green/30' : 'border-transparent opacity-80 hover:opacity-100'}
                        ${draggedItemIndex === idx || touchStartIndex === idx ? 'opacity-50 scale-95' : ''}
                      `}
                    >
                      {item.type === 'url' || item.fileType === 'video' ? (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center text-white relative">
                          {item.fileType === 'video' && <video src={item.url} className="absolute inset-0 w-full h-full object-cover opacity-50" />}
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="white" className="relative z-10">
                            <polygon points="5 3 19 12 5 21 5 3"/>
                          </svg>
                        </div>
                      ) : (
                        <img src={item.url} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                      )}
                      
                      <div className="absolute top-0 left-0 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-br font-mono">{idx + 1}</div>
                      <button type="button" onClick={(e) => { e.stopPropagation(); handleRemoveItem(idx); }} className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer" title="Remove">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-center text-placeholder mt-1 font-body">
                  Drag thumbnails to reorder • Touch and hold on mobile
                </p>
              </>
            ) : (
              <div className="w-full h-64 sm:h-80 lg:h-96 bg-light rounded-xl sm:rounded-2xl border border-input-border flex flex-col items-center justify-center text-placeholder">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mb-4 opacity-50">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                <p className="font-body">No media uploaded yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Other Documents */}
        <div>
          <label className="form-label">Any other documents or materials (PDF, PPT, DOCX, XLSX - Max 5 docs, 20MB total)</label>

          {/* Upload Area */}
          <div className="mt-2 p-6 sm:p-8 border-2 border-dashed border-accent-green-dark rounded-xl sm:rounded-2xl text-center bg-light flex flex-col items-center justify-center">
            <input
              type="file"
              id="documentsUpload"
              className="hidden"
              onChange={handleDocUpload}
              accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx"
              multiple
            />
            <label htmlFor="documentsUpload" className="cursor-pointer flex flex-col items-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent-green-dark w-8 h-8 sm:w-10 sm:h-10 mb-3">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="12" y1="18" x2="12" y2="12"></line>
                <line x1="9" y1="15" x2="15" y2="15"></line>
              </svg>
              <p className="text-sm sm:text-base text-placeholder mb-3 font-body">
                Drag and drop your files here or <span className="text-accent-green-dark underline cursor-pointer">choose</span>
              </p>
              <p className="text-xs text-placeholder mb-4 font-body">
                PDF, PPT, PPTX, DOC, DOCX, XLS, XLSX (Max 20MB total)
              </p>
              <div className="px-6 py-2.5 sm:px-8 sm:py-3 bg-button-dark border border-accent-green text-white text-sm sm:text-base lg:text-lg rounded-xl hover:bg-accent-green-dark transition-colors font-heading cursor-pointer">Upload Files</div>
            </label>

            {/* Total Size and Count Indicator */}
            {Array.isArray(otherDocuments) && otherDocuments.length > 0 && (
              <p className="mt-4 text-xs sm:text-sm font-medium font-body">
                <span className="text-accent-green-dark">{otherDocuments.length} / {MAX_DOCUMENT_COUNT} documents</span>
                <span className="text-placeholder"> • </span>
                <span className="text-accent-green-dark">{formatFileSize(getTotalDocSize())}</span>
                <span className="text-placeholder"> / 20 MB used</span>
              </p>
            )}
          </div>

          {/* Document List */}
          {Array.isArray(otherDocuments) && otherDocuments.length > 0 && (
            <div className="mt-4 space-y-2">
              {otherDocuments.map((doc, idx) => (
                <div
                  key={doc.id || idx}
                  className="flex items-center justify-between p-3 sm:p-4 bg-white border border-input-border rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent-green-dark flex-shrink-0">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-base text-dark font-medium truncate font-body">{doc.name}</p>
                      <p className="text-xs sm:text-sm text-placeholder font-body">{formatFileSize(doc.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveDocument(doc.id)}
                    className="ml-3 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                    title="Remove document"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InnovationMediaUpload;