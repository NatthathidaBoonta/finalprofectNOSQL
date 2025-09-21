import React, { useEffect, useRef, useState } from 'react';
import { Platform, Image as RNImage, View, StyleSheet } from 'react-native';

// Lightweight LazyImage that uses native Image on iOS/Android and IntersectionObserver on web
export default function LazyImage({ sourceUri, style, resizeMode = 'cover', placeholderStyle }) {
  if (Platform.OS !== 'web') {
    return <RNImage source={{ uri: sourceUri }} style={style} resizeMode={resizeMode} />;
  }

  // Web implementation
  const ref = useRef(null);
  const [loadedSrc, setLoadedSrc] = useState(null);

  useEffect(() => {
    if (!ref.current) return;
    let observer;
    try {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setLoadedSrc(sourceUri);
              observer.disconnect();
            }
          });
        },
        { rootMargin: '200px' }
      );
      observer.observe(ref.current);
    } catch (e) {
      // fallback: load immediately if IntersectionObserver not supported
      setLoadedSrc(sourceUri);
    }
    return () => {
      if (observer && observer.disconnect) observer.disconnect();
    };
  }, [sourceUri]);

  return (
    <View ref={ref} style={[styles.wrapper, style]}>
      {loadedSrc ? (
        // eslint-disable-next-line jsx-a11y/img-redundant-alt
        <img src={loadedSrc} alt="image" style={{ width: '100%', height: '100%', objectFit: resizeMode }} />
      ) : (
        <View style={[styles.placeholder, placeholderStyle]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
  },
  placeholder: {
    backgroundColor: '#eee',
    width: '100%',
    height: '100%'
  }
});
