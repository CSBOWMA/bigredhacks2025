"use client";
import React, { useState } from "react";

export default function CreateStreamPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: "",
    streamUrl: "",
    category: "gaming"
  });

  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.title.trim()) {
      newErrors.title = "Stream title is required";
    }
    
    if (!formData.description.trim()) {
      newErrors.description = "Stream description is required";
    }
    
    if (!formData.streamUrl.trim()) {
      newErrors.streamUrl = "Stream URL is required";
    } else if (!isValidUrl(formData.streamUrl)) {
      newErrors.streamUrl = "Please enter a valid URL";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      console.log("Creating stream with data:", formData);
      // Here you would typically send the data to your backend
      alert("Stream created successfully!");
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        tags: "",
        streamUrl: "",
        category: "gaming"
      });
      setIsPreviewMode(false);
    }
  };

  const togglePreview = () => {
    if (validateForm()) {
      setIsPreviewMode(!isPreviewMode);
    }
  };

  const categoryLabels = {
    gaming: "GAMING",
    music: "MUSIC",
    art: "ART",
    cooking: "COOKING",
    sports: "SPORTS",
    tech: "TECH",
    chatting: "CHATTING"
  };

  return (
    <div className="relative min-h-screen flex bg-[#322111] pt-25">
      {/* Left side: Title, Title/Description fields, and Preview */}
      <div className="flex-1 flex flex-col px-12">
        {!isPreviewMode ? (
          <>
            {/* Title and Description Fields */}
            <div className="flex-1 flex flex-col justify-center max-w-xl mx-auto w-full space-y-6">
              {/* Page Title */}
              <div className="text-center mb-6">
                <h1 className="text-5xl font-bold text-[#c8b481]">Create your stream!</h1>
              </div>

              {/* Stream Title */}
              <div>
                <label htmlFor="title" className="block text-[#c8b481] font-semibold mb-2">
                  Stream Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter your stream title..."
                  className={`w-full px-4 py-3 rounded-xl bg-[#7d664f] bg-opacity-50 text-[#c8b481] placeholder-[#bfa58b] border-2 focus:outline-none transition-colors ${
                    errors.title ? 'border-red-500' : 'border-[#7d664f] focus:border-[#c8b481]'
                  }`}
                />
                {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-[#c8b481] font-semibold mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Tell viewers what your stream is about..."
                  rows={4}
                  className={`w-full px-4 py-3 rounded-xl bg-[#7d664f] bg-opacity-50 text-[#c8b481] placeholder-[#bfa58b] border-2 focus:outline-none transition-colors resize-none ${
                    errors.description ? 'border-red-500' : 'border-[#7d664f] focus:border-[#c8b481]'
                  }`}
                />
                {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
              </div>
            </div>
          </>
        ) : (
          /* Preview Mode */
          <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col justify-center">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-[#c8b481]">Stream Preview</h2>
              <button
                onClick={togglePreview}
                className="px-4 py-2 bg-[#7d664f] hover:bg-[#6d5643] text-[#c8b481] rounded-lg transition-colors"
              >
                Back to Edit
              </button>
            </div>

            {/* Preview Hexagon */}
            <div className="flex items-center justify-center">
              <div
                className="hexagon bg-[#c8b481] w-[600px] h-[520px] drop-shadow-2xl flex items-center justify-center overflow-hidden"
                style={{
                  clipPath: "polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0% 50%)",
                }}
              >
                <div className="text-center p-8">
                  <div className="text-2xl font-bold text-[#322111] mb-2 border-2 border-[#322111] px-4 py-2 rounded-lg inline-block">
                    {categoryLabels[formData.category as keyof typeof categoryLabels]}
                  </div>
                  <h3 className="text-2xl font-bold text-[#322111] mb-4 mt-4">{formData.title}</h3>
                  <p className="text-[#322111] mb-4 leading-relaxed">{formData.description}</p>
                  {formData.tags && (
                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                      {formData.tags.split(',').map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-[#322111] text-[#c8b481] rounded-full text-sm"
                        >
                          #{tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="text-sm text-[#322111] opacity-75">
                    Stream URL: {formData.streamUrl}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right side: Remaining Form Fields */}
      <div className="w-1/2 flex items-center justify-center px-8">
        <div className="w-full max-w-lg space-y-6">
          {/* Category Selection */}
          <div>
            <label htmlFor="category" className="block text-[#c8b481] font-semibold mb-2">
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl bg-[#7d664f] bg-opacity-50 text-[#c8b481] border-2 border-[#7d664f] focus:border-[#c8b481] focus:outline-none transition-colors"
            >
              <option value="gaming">Gaming</option>
              <option value="music">Music</option>
              <option value="art">Art & Creative</option>
              <option value="cooking">Cooking</option>
              <option value="sports">Sports</option>
              <option value="tech">Technology</option>
              <option value="chatting">Just Chatting</option>
            </select>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-[#c8b481] font-semibold mb-2">
              Tags
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="Add tags separated by commas (e.g., chill, music, acoustic)"
              className="w-full px-4 py-3 rounded-xl bg-[#7d664f] bg-opacity-50 text-[#c8b481] placeholder-[#bfa58b] border-2 border-[#7d664f] focus:border-[#c8b481] focus:outline-none transition-colors"
            />
          </div>

          {/* Stream URL */}
          <div>
            <label htmlFor="streamUrl" className="block text-[#c8b481] font-semibold mb-2">
              Stream URL *
            </label>
            <input
              type="url"
              id="streamUrl"
              name="streamUrl"
              value={formData.streamUrl}
              onChange={handleInputChange}
              placeholder="https://your-stream-url.com/stream.m3u8"
              className={`w-full px-4 py-3 rounded-xl bg-[#7d664f] bg-opacity-50 text-[#c8b481] placeholder-[#bfa58b] border-2 focus:outline-none transition-colors ${
                errors.streamUrl ? 'border-red-500' : 'border-[#7d664f] focus:border-[#c8b481]'
              }`}
            />
            {errors.streamUrl && <p className="text-red-400 text-sm mt-1">{errors.streamUrl}</p>}
            <p className="text-[#bfa58b] text-sm mt-1">
              Supported formats: HLS (.m3u8), RTMP, or direct video URLs
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-6">
            <button
              type="button"
              onClick={togglePreview}
              className="flex-1 py-3 px-6 bg-[#7d664f] hover:bg-[#6d5643] text-[#c8b481] font-semibold rounded-xl transition-colors"
            >
              Preview Stream
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="flex-1 py-3 px-6 bg-[#c8b481] hover:bg-[#b8a474] text-[#322111] font-semibold rounded-xl transition-colors"
            >
              Go Live
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}