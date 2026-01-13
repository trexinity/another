import { Box, AspectRatio } from '@chakra-ui/react';

export const CustomVideoPlayer = ({ videoUrl, videoSource, title }) => {
  const renderPlayer = () => {
    if (videoSource === 'archive') {
      return (
        <iframe
          src={videoUrl.replace('/details/', '/embed/')}
          title={title}
          width="100%"
          height="100%"
          frameBorder="0"
          allowFullScreen
          allow="autoplay; fullscreen"
          style={{ background: '#000' }}
        />
      );
    }

    if (videoSource === 'googledrive') {
      return (
        <iframe
          src={videoUrl}
          title={title}
          width="100%"
          height="100%"
          frameBorder="0"
          allowFullScreen
          allow="autoplay"
          style={{ background: '#000' }}
        />
      );
    }

    // Cloudinary or direct video
    return (
      <video
        src={videoUrl}
        title={title}
        controls
        controlsList="nodownload"
        style={{ width: '100%', height: '100%', background: '#000' }}
      >
        Your browser does not support video playback.
      </video>
    );
  };

  return (
    <Box
      w="100%"
      bg="black"
      position="relative"
      sx={{
        '& video': {
          objectFit: 'contain',
        },
      }}
    >
      <AspectRatio ratio={16 / 9}>
        {renderPlayer()}
      </AspectRatio>
    </Box>
  );
};
