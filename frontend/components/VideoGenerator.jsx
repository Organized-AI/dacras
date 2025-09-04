import React, { useState, useEffect } from 'react';
import { 
  Play, 
  User, 
  FileText, 
  Settings, 
  Download, 
  RefreshCw, 
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react';
import { useVideoGeneration, useActors, useImageGeneration } from '../hooks/useAPI';

const VideoGenerator = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    script: '',
    product_name: '',
    target_audience: '',
    key_message: '',
    tone: 'friendly',
    duration: 30,
    call_to_action: 'Get started today!',
    actor_id: '',
    background_style: 'modern_home',
    aspect_ratio: '16:9',
    quality: 'hd',
    voice_speed: 1.0,
    add_captions: true,
    brand_colors: ['#6366f1', '#ec4899'],
    logo_url: ''
  });

  const { actors, loading: actorsLoading } = useActors();
  const { images: backgrounds, generateBackgrounds } = useImageGeneration();
  const {
    videoData,
    loading: videoLoading,
    error: videoError,
    jobStatus,
    progress,
    generateVideo,
    generateVariations,
    reset: resetVideo
  } = useVideoGeneration();

  const [selectedActor, setSelectedActor] = useState(null);
  const [selectedBackground, setSelectedBackground] = useState(null);
  const [variations, setVariations] = useState({ count: 3, vary_actors: true, vary_backgrounds: true });

  // Auto-generate backgrounds based on product type
  useEffect(() => {
    if (formData.product_name) {
      const productType = detectProductType(formData.product_name, formData.key_message);
      generateBackgrounds(productType, 5).catch(console.error);
    }
  }, [formData.product_name, formData.key_message, generateBackgrounds]);

  const detectProductType = (productName, keyMessage) => {
    const text = `${productName} ${keyMessage}`.toLowerCase();
    
    if (text.includes('tech') || text.includes('software') || text.includes('app')) {
      return 'technology';
    } else if (text.includes('business') || text.includes('corporate') || text.includes('professional')) {
      return 'business';
    } else {
      return 'lifestyle';
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleActorSelect = (actor) => {
    setSelectedActor(actor);
    setFormData(prev => ({ ...prev, actor_id: actor.id }));
  };

  const handleBackgroundSelect = (background) => {
    setSelectedBackground(background);
  };

  const handleGenerateVideo = async () => {
    try {
      const videoOptions = {
        ...formData,
        background_image_url: selectedBackground?.url
      };

      await generateVideo(videoOptions);
      setStep(4); // Move to results step
    } catch (error) {
      console.error('Video generation failed:', error);
    }
  };

  const handleGenerateVariations = async () => {
    try {
      const variationOptions = {
        base_config: {
          ...formData,
          background_image_url: selectedBackground?.url
        },
        ...variations
      };

      await generateVariations(variationOptions);
      setStep(4); // Move to results step
    } catch (error) {
      console.error('Variation generation failed:', error);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <FileText className="w-12 h-12 text-purple-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Script & Product Details</h2>
        <p className="text-gray-400">Tell us about your product and message</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Product Name *</label>
          <input
            type="text"
            value={formData.product_name}
            onChange={(e) => handleInputChange('product_name', e.target.value)}
            placeholder="e.g., EcoClean Pro"
            className="w-full p-3 bg-white/5 border border-white/20 rounded-lg focus:border-purple-400 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Target Audience *</label>
          <input
            type="text"
            value={formData.target_audience}
            onChange={(e) => handleInputChange('target_audience', e.target.value)}
            placeholder="e.g., environmentally conscious homeowners"
            className="w-full p-3 bg-white/5 border border-white/20 rounded-lg focus:border-purple-400 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Key Message *</label>
        <input
          type="text"
          value={formData.key_message}
          onChange={(e) => handleInputChange('key_message', e.target.value)}
          placeholder="e.g., chemical-free cleaning solutions"
          className="w-full p-3 bg-white/5 border border-white/20 rounded-lg focus:border-purple-400 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Custom Script (Optional)</label>
        <textarea
          value={formData.script}
          onChange={(e) => handleInputChange('script', e.target.value)}
          placeholder="Enter your custom script or leave blank for AI generation..."
          rows={4}
          className="w-full p-3 bg-white/5 border border-white/20 rounded-lg focus:border-purple-400 focus:outline-none resize-none"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Tone</label>
          <select
            value={formData.tone}
            onChange={(e) => handleInputChange('tone', e.target.value)}
            className="w-full p-3 bg-white/5 border border-white/20 rounded-lg focus:border-purple-400 focus:outline-none"
          >
            <option value="friendly">Friendly</option>
            <option value="professional">Professional</option>
            <option value="urgent">Urgent</option>
            <option value="casual">Casual</option>
            <option value="authoritative">Authoritative</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Duration (seconds)</label>
          <input
            type="number"
            min="15"
            max="60"
            value={formData.duration}
            onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
            className="w-full p-3 bg-white/5 border border-white/20 rounded-lg focus:border-purple-400 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Call to Action</label>
          <input
            type="text"
            value={formData.call_to_action}
            onChange={(e) => handleInputChange('call_to_action', e.target.value)}
            placeholder="e.g., Try it risk-free today!"
            className="w-full p-3 bg-white/5 border border-white/20 rounded-lg focus:border-purple-400 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <User className="w-12 h-12 text-purple-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Choose Your AI Actor</h2>
        <p className="text-gray-400">Select an actor that represents your brand</p>
      </div>

      {actorsLoading ? (
        <div className="flex justify-center py-12">
          <Loader className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      ) : (
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
          {actors.map((actor) => (
            <div
              key={actor.id}
              onClick={() => handleActorSelect(actor)}
              className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                selectedActor?.id === actor.id
                  ? 'border-purple-400 ring-2 ring-purple-400/50'
                  : 'border-white/20 hover:border-white/40'
              }`}
            >
              <div className="aspect-[3/4] bg-gradient-to-br from-gray-800 to-gray-900">
                <img
                  src={actor.avatar_url}
                  alt={actor.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/api/placeholder/300/400';
                  }}
                />
              </div>
              
              <div className="p-3 bg-white/5 backdrop-blur-sm">
                <h3 className="font-medium text-sm mb-1">{actor.name}</h3>
                <p className="text-xs text-gray-400 capitalize">
                  {actor.gender} • {actor.age_range} • {actor.style}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {actor.personality_traits?.slice(0, 2).map((trait, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>

              {selectedActor?.id === actor.id && (
                <div className="absolute top-2 right-2">
                  <CheckCircle className="w-6 h-6 text-purple-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Settings className="w-12 h-12 text-purple-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Video Settings</h2>
        <p className="text-gray-400">Customize your video generation</p>
      </div>

      {/* Background Selection */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Choose Background</h3>
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
          {backgrounds.map((background, index) => (
            <div
              key={index}
              onClick={() => handleBackgroundSelect(background)}
              className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                selectedBackground?.id === background.id
                  ? 'border-purple-400 ring-2 ring-purple-400/50'
                  : 'border-white/20 hover:border-white/40'
              }`}
            >
              <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900">
                <img
                  src={background.url}
                  alt={background.prompt || 'Background'}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {selectedBackground?.id === background.id && (
                <div className="absolute top-2 right-2">
                  <CheckCircle className="w-5 h-5 text-purple-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Video Options */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Aspect Ratio</label>
          <select
            value={formData.aspect_ratio}
            onChange={(e) => handleInputChange('aspect_ratio', e.target.value)}
            className="w-full p-3 bg-white/5 border border-white/20 rounded-lg focus:border-purple-400 focus:outline-none"
          >
            <option value="16:9">16:9 (Landscape)</option>
            <option value="9:16">9:16 (Portrait)</option>
            <option value="1:1">1:1 (Square)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Quality</label>
          <select
            value={formData.quality}
            onChange={(e) => handleInputChange('quality', e.target.value)}
            className="w-full p-3 bg-white/5 border border-white/20 rounded-lg focus:border-purple-400 focus:outline-none"
          >
            <option value="sd">SD (Faster)</option>
            <option value="hd">HD (Recommended)</option>
            <option value="4k">4K (Highest Quality)</option>
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Voice Speed</label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={formData.voice_speed}
            onChange={(e) => handleInputChange('voice_speed', parseFloat(e.target.value))}
            className="w-full accent-purple-400"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0.5x (Slow)</span>
            <span>{formData.voice_speed}x</span>
            <span>2x (Fast)</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.add_captions}
              onChange={(e) => handleInputChange('add_captions', e.target.checked)}
              className="rounded border-white/20 bg-white/5 text-purple-400 focus:ring-purple-400"
            />
            <span className="text-sm">Add captions</span>
          </label>
        </div>
      </div>

      {/* Variations Options */}
      <div className="border-t border-white/20 pt-6">
        <h3 className="text-lg font-semibold mb-4">Generation Options</h3>
        
        <div className="bg-white/5 rounded-lg p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Number of variations: {variations.count}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={variations.count}
              onChange={(e) => setVariations(prev => ({ ...prev, count: parseInt(e.target.value) }))}
              className="w-full accent-purple-400"
            />
          </div>

          <div className="flex space-x-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={variations.vary_actors}
                onChange={(e) => setVariations(prev => ({ ...prev, vary_actors: e.target.checked }))}
                className="rounded border-white/20 bg-white/5 text-purple-400 focus:ring-purple-400"
              />
              <span className="text-sm">Vary actors</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={variations.vary_backgrounds}
                onChange={(e) => setVariations(prev => ({ ...prev, vary_backgrounds: e.target.checked }))}
                className="rounded border-white/20 bg-white/5 text-purple-400 focus:ring-purple-400"
              />
              <span className="text-sm">Vary backgrounds</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Play className="w-12 h-12 text-purple-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Your Video is Ready!</h2>
        <p className="text-gray-400">Preview and download your generated video</p>
      </div>

      {videoLoading || (jobStatus && jobStatus.status !== 'completed') ? (
        <div className="text-center py-12">
          <div className="relative">
            <Loader className="w-16 h-16 text-purple-400 animate-spin mx-auto mb-4" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-medium">{Math.round(progress)}%</span>
            </div>
          </div>
          
          <p className="text-lg font-medium mb-2">
            {jobStatus?.status === 'processing' ? 'Generating your video...' : 'Preparing...'}
          </p>
          
          <div className="w-64 mx-auto bg-white/10 rounded-full h-2 mb-4">
            <div 
              className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-sm text-gray-400">
            This usually takes 1-2 minutes. Please don't close this window.
          </p>
        </div>
      ) : videoError ? (
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2 text-red-400">Generation Failed</h3>
          <p className="text-gray-400 mb-4">{videoError}</p>
          <button
            onClick={() => {
              resetVideo();
              setStep(1);
            }}
            className="bg-red-500 hover:bg-red-600 px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : jobStatus?.status === 'completed' ? (
        <div className="space-y-6">
          <div className="bg-white/5 rounded-lg p-6">
            <div className="aspect-video bg-black rounded-lg mb-4 relative overflow-hidden">
              {jobStatus.result?.download_url ? (
                <video
                  controls
                  className="w-full h-full"
                  poster={jobStatus.result.thumbnail_url}
                >
                  <source src={jobStatus.result.download_url} type="video/mp4" />
                </video>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Play className="w-16 h-16 text-white/50" />
                </div>
              )}
            </div>

            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">Generated Video</h3>
                <p className="text-sm text-gray-400">
                  Duration: {jobStatus.result?.duration}s • Size: {jobStatus.result?.file_size}MB
                </p>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => window.open(jobStatus.result?.download_url, '_blank')}
                  className="bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>

                <button
                  onClick={() => {
                    resetVideo();
                    setStep(1);
                  }}
                  className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Create Another</span>
                </button>
              </div>
            </div>
          </div>

          {/* Show variations if available */}
          {videoData?.results && Object.keys(videoData.results).length > 1 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Variations</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(videoData.results).map(([jobId, result]) => (
                  <div key={jobId} className="bg-white/5 rounded-lg p-4">
                    <div className="aspect-video bg-black rounded mb-2">
                      {result.status === 'completed' && (
                        <video
                          controls
                          className="w-full h-full rounded"
                          poster={result.result?.thumbnail_url}
                        >
                          <source src={result.result?.download_url} type="video/mp4" />
                        </video>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Variation {jobId.slice(-4)}</span>
                      {result.status === 'completed' && (
                        <button
                          onClick={() => window.open(result.result?.download_url, '_blank')}
                          className="text-purple-400 hover:text-purple-300 text-sm"
                        >
                          Download
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );

  const canProceed = (currentStep) => {
    switch (currentStep) {
      case 1:
        return formData.product_name && formData.target_audience && formData.key_message;
      case 2:
        return selectedActor;
      case 3:
        return selectedBackground;
      default:
        return true;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div
              key={stepNumber}
              className={`flex items-center ${stepNumber < 4 ? 'flex-1' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/10 text-gray-400'
                }`}
              >
                {stepNumber}
              </div>
              
              {stepNumber < 4 && (
                <div
                  className={`h-1 flex-1 mx-4 rounded ${
                    step > stepNumber ? 'bg-purple-500' : 'bg-white/10'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        
        <div className="flex justify-between text-sm text-gray-400">
          <span>Script</span>
          <span>Actor</span>
          <span>Settings</span>
          <span>Generate</span>
        </div>
      </div>

      {/* Step content */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}

        {/* Navigation buttons */}
        {step < 4 && (
          <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
            >
              Previous
            </button>

            {step === 3 ? (
              <div className="flex space-x-4">
                <button
                  onClick={handleGenerateVideo}
                  disabled={!canProceed(step) || videoLoading}
                  className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-all flex items-center space-x-2"
                >
                  <Play className="w-4 h-4" />
                  <span>Generate Single Video</span>
                </button>
                
                <button
                  onClick={handleGenerateVariations}
                  disabled={!canProceed(step) || videoLoading}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-all flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Generate {variations.count} Variations</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed(step)}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-all"
              >
                Next
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoGenerator;