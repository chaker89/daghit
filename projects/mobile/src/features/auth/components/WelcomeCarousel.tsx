import { useEffect, useRef, useState } from 'react';
import { Image } from 'expo-image';
import { Pressable, ScrollView, StyleSheet, Text, View, type LayoutChangeEvent, type ScrollViewInstance } from 'react-native';
import { brand } from '@/constants/brand';

const slides = [
  { eyebrow: 'DAGHIT · FITNESS IN LEBANON', title: 'Move more.\nFeel your best.', body: 'Discover and book fitness experiences that fit your life.' },
  { eyebrow: 'STUDIO CLASSES', title: 'Find a class\nyou love.', body: 'Explore Pilates, strength, and more at local studios.' },
  { eyebrow: 'PERSONAL TRAINING', title: 'Get coaching\nthat moves you.', body: 'Book one-to-one training at a gym or studio.' },
  { eyebrow: 'TRAIN AT HOME', title: 'Fitness that\ncomes to you.', body: 'Find a personal trainer for an at-home session.' },
];

export function WelcomeCarousel() {
  const scrollRef = useRef<ScrollViewInstance | null>(null);
  const [width, setWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (width <= 0) return;
    const timer = setInterval(() => {
      const nextIndex = (activeIndex + 1) % slides.length;
      setActiveIndex(nextIndex);
      scrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
    }, 5000);
    return () => clearInterval(timer);
  }, [activeIndex, width]);

  const onLayout = (event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width;
    if (nextWidth !== width) {
      setWidth(nextWidth);
      scrollRef.current?.scrollTo({ x: activeIndex * nextWidth, animated: false });
    }
  };

  const onScrollEnd = (event: { nativeEvent: { contentOffset: { x: number } } }) => {
    if (width > 0) setActiveIndex(Math.max(0, Math.min(slides.length - 1, Math.round(event.nativeEvent.contentOffset.x / width))));
  };

  const goToSlide = (index: number) => {
    setActiveIndex(index);
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
  };

  return <View onLayout={onLayout} style={styles.carousel}>
    <Image
      accessibilityLabel="Athlete in a teal fitness studio"
      source={require('@/assets/images/welcome-fitness.png')}
      contentFit="cover"
      transition={0}
      style={StyleSheet.absoluteFill}
    />
    <View pointerEvents="none" style={styles.scrim} />
    <ScrollView
      ref={scrollRef}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      scrollEventThrottle={16}
      onMomentumScrollEnd={onScrollEnd}
      style={StyleSheet.absoluteFill}
      contentContainerStyle={styles.slideRow}>
      {slides.map(slide => <View key={slide.eyebrow} style={[styles.slide, { width }]}>
        <View style={styles.copy}>
          <Text style={styles.eyebrow}>{slide.eyebrow}</Text>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.body}>{slide.body}</Text>
        </View>
      </View>)}
    </ScrollView>
    <View style={styles.pagination}>
      {slides.map((slide, index) => <Pressable
        key={slide.eyebrow}
        accessibilityRole="button"
        accessibilityLabel={`Show slide ${index + 1} of ${slides.length}`}
        accessibilityState={{ selected: activeIndex === index }}
        hitSlop={8}
        onPress={() => goToSlide(index)}
        style={[styles.dot, activeIndex === index && styles.activeDot]}
      />)}
    </View>
  </View>;
}

const styles = StyleSheet.create({
  carousel: { flex: 1, minHeight: 390, maxHeight: 500, width: '100%', alignSelf: 'stretch', borderRadius: 30, overflow: 'hidden', backgroundColor: brand.tealDark, marginTop: 8 },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: '#062F32', opacity: 0.42 },
  slideRow: { flexGrow: 1, flexDirection: 'row', height: '100%' },
  slide: { height: '100%', justifyContent: 'flex-end', paddingHorizontal: 24, paddingTop: 24, paddingBottom: 56 },
  copy: { maxWidth: 300 },
  eyebrow: { color: '#A9E6DF', fontSize: 10, fontWeight: '800', letterSpacing: 1.1, marginBottom: 10 },
  title: { color: brand.white, fontSize: 37, lineHeight: 42, fontWeight: '800', letterSpacing: -0.8 },
  body: { color: brand.white, fontSize: 15, lineHeight: 22, marginTop: 10, opacity: 0.96 },
  pagination: { position: 'absolute', bottom: 18, alignSelf: 'center', flexDirection: 'row', gap: 8, alignItems: 'center' },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#FFFFFF88' },
  activeDot: { width: 22, backgroundColor: brand.white },
});
