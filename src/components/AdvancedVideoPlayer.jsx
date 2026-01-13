import { useEffect, useRef, useState } from 'react';
import {
  Box,
  AspectRatio,
  HStack,
  IconButton,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorMode,
  Tooltip,
} from '@chakra-ui/react';
import {
  FiPlay,
  FiPause,
  FiVolume2,
  FiVolumeX,
  FiMaximize,
  FiMinimize,
  FiSettings,
  FiSkipForward,
  FiSkipBack,
} from 'react-icons/fi';

export const AdvancedVideoPlayer = ({ videoUrl, videoSource = 'archive', title, onProgress }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const { colorMode } = useColorMode();

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [buffered, setBuffered] = useState(0);

  const controlsTimeout = useRef(null);

  // Archive.org video detection and conversion
  const isArchive = videoSource === 'archive' || videoUrl?.includes('archive.org');
  
  const getArchiveVideoUrl = (url) => {
    if (!url) return '';
    
    // If it's already a direct video URL, return it
    if (url.includes('.mp4') || url.includes('.webm') || url.includes('.ogv')) {
      return url;
    }
    
    // Convert archive.org details page to embed
    if (url.includes('/details/')) {
      const identifier = url.split('/details/')[1]?.split('/')[0];
      if (identifier) {
        // Return direct video URL
        return `https://archive.org/download/${identifier}/${identifier}.mp4`;
      }
    }
    
    return url;
  };

  const processedVideoUrl = isArchive ? getArchiveVideoUrl(videoUrl) : videoUrl;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || isArchive) return; // Skip for archive iframe

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.buffered.length > 0) {
        setBuffered((video.buffered.end(video.buffered.length - 1) / video.duration) * 100);
      }
      onProgress?.(video.currentTime, video.duration);
    };

    const handleLoadedMetadata = () => setDuration(video.duration);
    const handlePlay = () => setPlaying(true);
    const handlePause = () => setPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [onProgress, isArchive]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    playing ? video.pause() : video.play();
  };

  const handleSeek = (value) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = value;
    setCurrentTime(value);
  };

  const handleVolumeChange = (value) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = value;
    setVolume(value);
    setMuted(value === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    const newMuted = !muted;
    video.muted = newMuted;
    setMuted(newMuted);
  };

  const changePlaybackRate = (rate) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const skip = (seconds) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!fullscreen) {
      if (container.requestFullscreen) container.requestFullscreen();
      else if (container.webkitRequestFullscreen) container.webkitRequestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }
    setFullscreen(!fullscreen);
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimeout.current);
    controlsTimeout.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  };

  const renderPlayer = () => {
    // Archive.org - use HTML5 video with direct link
    if (isArchive) {
      return (
        <video
          ref={videoRef}
          src={processedVideoUrl}
          style={{ width: '100%', height: '100%', background: '#000' }}
          onClick={togglePlay}
          onDoubleClick={toggleFullscreen}
          controls={false}
          crossOrigin="anonymous"
        >
          Your browser does not support video playback.
        </video>
      );
    }

    // Cloudinary or other direct video
    return (
      <video
        ref={videoRef}
        src={videoUrl}
        style={{ width: '100%', height: '100%', background: '#000' }}
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
        controls={false}
      >
        Your browser does not support video playback.
      </video>
    );
  };

  return (
    <Box
      ref={containerRef}
      position="relative"
      w="100%"
      bg="black"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => playing && setShowControls(false)}
    >
      <AspectRatio ratio={16 / 9}>{renderPlayer()}</AspectRatio>

      {/* Custom Controls */}
      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        bgGradient="linear(to-t, rgba(0,0,0,0.9), transparent)"
        p={4}
        opacity={showControls ? 1 : 0}
        transition="opacity 0.3s"
      >
        {/* Progress Bar */}
        <Slider
          value={currentTime}
          min={0}
          max={duration || 100}
          onChange={handleSeek}
          mb={3}
          colorScheme="whiteAlpha"
        >
          <SliderTrack bg="whiteAlpha.300" h="4px">
            <Box position="absolute" h="100%" w={`${buffered}%`} bg="whiteAlpha.500" />
            <SliderFilledTrack bg="white" />
          </SliderTrack>
          <SliderThumb boxSize={4} />
        </Slider>

        <HStack justify="space-between" spacing={3}>
          {/* Left Controls */}
          <HStack spacing={2}>
            <IconButton
              aria-label="Skip back"
              icon={<FiSkipBack />}
              onClick={() => skip(-10)}
              variant="ghost"
              color="white"
              size="sm"
            />

            <IconButton
              aria-label={playing ? 'Pause' : 'Play'}
              icon={playing ? <FiPause /> : <FiPlay />}
              onClick={togglePlay}
              variant="ghost"
              color="white"
              size="lg"
            />

            <IconButton
              aria-label="Skip forward"
              icon={<FiSkipForward />}
              onClick={() => skip(10)}
              variant="ghost"
              color="white"
              size="sm"
            />

            <HStack spacing={2} ml={2}>
              <IconButton
                aria-label="Mute"
                icon={muted || volume === 0 ? <FiVolumeX /> : <FiVolume2 />}
                onClick={toggleMute}
                variant="ghost"
                color="white"
                size="sm"
              />
              <Slider
                value={muted ? 0 : volume}
                min={0}
                max={1}
                step={0.1}
                onChange={handleVolumeChange}
                w="80px"
                colorScheme="whiteAlpha"
              >
                <SliderTrack bg="whiteAlpha.300">
                  <SliderFilledTrack bg="white" />
                </SliderTrack>
                <SliderThumb boxSize={3} />
              </Slider>
            </HStack>

            <Text color="white" fontSize="sm" ml={2}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </Text>
          </HStack>

          {/* Right Controls */}
          <HStack spacing={2}>
            <Menu>
              <Tooltip label="Playback speed">
                <MenuButton
                  as={IconButton}
                  icon={<FiSettings />}
                  variant="ghost"
                  color="white"
                  size="sm"
                  aria-label="Settings"
                />
              </Tooltip>
              <MenuList bg={colorMode === 'dark' ? 'black' : 'white'}>
                <Text px={3} py={1} fontSize="xs" opacity={0.7} fontWeight="bold">
                  SPEED
                </Text>
                {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                  <MenuItem
                    key={rate}
                    onClick={() => changePlaybackRate(rate)}
                    fontWeight={playbackRate === rate ? 'bold' : 'normal'}
                  >
                    {rate}x {rate === 1 && '(Normal)'}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>

            <IconButton
              aria-label="Fullscreen"
              icon={fullscreen ? <FiMinimize /> : <FiMaximize />}
              onClick={toggleFullscreen}
              variant="ghost"
              color="white"
              size="sm"
            />
          </HStack>
        </HStack>
      </Box>
    </Box>
  );
};
