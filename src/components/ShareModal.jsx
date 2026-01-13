import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  IconButton,
  Input,
  Button,
  Text,
  useToast,
  useColorMode,
  Tooltip,
  Divider,
} from '@chakra-ui/react';
import {
  FiLink,
  FiMail,
  FiTwitter,
  FiMessageCircle,
  FiCopy,
} from 'react-icons/fi';
import { FaWhatsapp, FaFacebook, FaTelegram, FaReddit } from 'react-icons/fa';

export const ShareModal = ({ isOpen, onClose, title, url }) => {
  const { colorMode } = useColorMode();
  const toast = useToast();

  const shareUrl = url || window.location.href;
  const shareTitle = title || 'Check this out on another';

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: 'Link copied!', status: 'success', duration: 1500, isClosable: true });
    } catch (error) {
      toast({ title: 'Failed to copy', status: 'error', duration: 2000, isClosable: true });
    }
  };

  const shareVia = (platform) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(shareTitle);

    const urls = {
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
      email: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
      sms: `sms:?body=${encodedTitle}%20${encodedUrl}`,
    };

    window.open(urls[platform], '_blank', 'noopener,noreferrer');
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, url: shareUrl });
      } catch (error) {
        if (error.name !== 'AbortError') {
          toast({ title: 'Share failed', status: 'error', duration: 2000, isClosable: true });
        }
      }
    } else {
      copyToClipboard();
    }
  };

  const platforms = [
    { name: 'WhatsApp', icon: FaWhatsapp, color: '#25D366', key: 'whatsapp' },
    { name: 'Facebook', icon: FaFacebook, color: '#1877F2', key: 'facebook' },
    { name: 'Twitter', icon: FiTwitter, color: '#1DA1F2', key: 'twitter' },
    { name: 'Telegram', icon: FaTelegram, color: '#0088CC', key: 'telegram' },
    { name: 'Reddit', icon: FaReddit, color: '#FF4500', key: 'reddit' },
    { name: 'Email', icon: FiMail, color: '#EA4335', key: 'email' },
    { name: 'SMS', icon: FiMessageCircle, color: '#34B7F1', key: 'sms' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay backdropFilter="blur(8px)" />
      <ModalContent>
        <ModalHeader>Share</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={5} align="stretch">
            {/* Link Input */}
            <HStack>
              <Input value={shareUrl} isReadOnly variant="filled" />
              <Tooltip label="Copy link">
                <IconButton
                  aria-label="Copy link"
                  icon={<FiCopy />}
                  onClick={copyToClipboard}
                  variant="solid"
                />
              </Tooltip>
            </HStack>

            <Divider />

            {/* Platform Icons */}
            <VStack spacing={3} align="stretch">
              <Text fontSize="sm" fontWeight="700" opacity={0.7}>
                SHARE VIA
              </Text>
              <HStack spacing={3} justify="space-around" flexWrap="wrap">
                {platforms.map((platform) => (
                  <Tooltip key={platform.key} label={platform.name}>
                    <IconButton
                      aria-label={`Share on ${platform.name}`}
                      icon={<platform.icon />}
                      onClick={() => shareVia(platform.key)}
                      variant="ghost"
                      size="lg"
                      fontSize="24px"
                      color={colorMode === 'dark' ? 'white' : platform.color}
                      _hover={{ transform: 'scale(1.15)' }}
                      transition="transform 0.2s"
                    />
                  </Tooltip>
                ))}
              </HStack>
            </VStack>

            {/* Native Share (mobile) */}
            {navigator.share && (
              <>
                <Divider />
                <Button
                  leftIcon={<FiLink />}
                  onClick={shareNative}
                  variant="outline"
                  size="lg"
                  w="full"
                >
                  More options
                </Button>
              </>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
