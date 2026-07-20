import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useTelegram } from './hooks/useTelegram';
import { useOnboarding } from './hooks/useOnboarding';
import { Layout } from './components/ui/Layout';
import { PlaceholderScreen } from './components/ui/PlaceholderScreen';
import { SuitcaseIcon, ProfileIcon } from './components/ui/icons';

const OnboardingScreen = lazy(() =>
  import('./components/onboarding/OnboardingScreen').then((module) => ({ default: module.OnboardingScreen }))
);
const HomeScreen = lazy(() => import('./screens/HomeScreen').then((module) => ({ default: module.HomeScreen })));
const WardrobeScreen = lazy(() =>
  import('./screens/WardrobeScreen').then((module) => ({ default: module.WardrobeScreen }))
);
const WardrobePremiumScreen = lazy(() =>
  import('./screens/WardrobePremiumScreen').then((module) => ({ default: module.WardrobePremiumScreen }))
);
const ColorQuizScreen = lazy(() =>
  import('./screens/ColorQuizScreen').then((module) => ({ default: module.ColorQuizScreen }))
);
const ProfileScreen = lazy(() =>
  import('./screens/ProfileScreen').then((module) => ({ default: module.ProfileScreen }))
);
const AvatarCreatorScreen = lazy(() =>
  import('./screens/AvatarCreatorScreen').then((module) => ({ default: module.AvatarCreatorScreen }))
);
const AvatarResultScreen = lazy(() =>
  import('./screens/AvatarResultScreen').then((module) => ({ default: module.AvatarResultScreen }))
);
const AddItemScreen = lazy(() =>
  import('./screens/AddItemScreen').then((module) => ({ default: module.AddItemScreen }))
);
const ItemDetailScreen = lazy(() =>
  import('./screens/ItemDetailScreen').then((module) => ({ default: module.ItemDetailScreen }))
);
const TryOnScreen = lazy(() =>
  import('./screens/TryOnScreen').then((module) => ({ default: module.TryOnScreen }))
);
const OutfitsListScreen = lazy(() =>
  import('./screens/OutfitsListScreen').then((module) => ({ default: module.OutfitsListScreen }))
);
const OutfitCreatorScreen = lazy(() =>
  import('./screens/OutfitCreatorScreen').then((module) => ({ default: module.OutfitCreatorScreen }))
);
const GenerateLookScreen = lazy(() =>
  import('./screens/GenerateLookScreen').then((module) => ({ default: module.GenerateLookScreen }))
);
const OutfitDetailScreen = lazy(() =>
  import('./screens/OutfitDetailScreen').then((module) => ({ default: module.OutfitDetailScreen }))
);
const ChatScreen = lazy(() => import('./screens/ChatScreen').then((module) => ({ default: module.ChatScreen })));
const AIStylistScreen = lazy(() =>
  import('./screens/AIStylistScreen').then((module) => ({ default: module.AIStylistScreen }))
);
const CapsuleWardrobeScreen = lazy(() =>
  import('./screens/CapsuleWardrobeScreen').then((module) => ({ default: module.CapsuleWardrobeScreen }))
);
const PremiumScreen = lazy(() =>
  import('./screens/PremiumScreen').then((module) => ({ default: module.PremiumScreen }))
);
const ShoppingScreen = lazy(() =>
  import('./screens/ShoppingScreen').then((module) => ({ default: module.ShoppingScreen }))
);

function RouteFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        color: '#6f6862',
        background: 'linear-gradient(180deg, #fff8f6 0%, #f9f8ff 100%)',
      }}
    >
      <span
        style={{
          padding: '12px 18px',
          borderRadius: 999,
          background: 'rgba(255, 255, 255, 0.78)',
          boxShadow: '0 14px 36px rgba(120, 80, 100, 0.12)',
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        Загружаем раздел…
      </span>
    </div>
  );
}

function App() {
  useTelegram();
  const { seen, markSeen } = useOnboarding();

  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
      <Route
        path="/onboarding"
        element={seen ? <Navigate to="/" replace /> : <OnboardingScreen onFinish={markSeen} />}
      />
      {!seen ? (
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      ) : (
        <>
          <Route path="/analysis/color-type" element={<ColorQuizScreen />} />
          <Route path="/avatar/create" element={<AvatarCreatorScreen />} />
          <Route path="/avatar/result" element={<AvatarResultScreen />} />
          <Route path="/avatar/tryon/:itemId" element={<TryOnScreen />} />
          <Route path="/wardrobe/add" element={<AddItemScreen />} />
          <Route path="/wardrobe/outfits/create" element={<OutfitCreatorScreen />} />
          <Route path="/wardrobe/outfits/generate" element={<GenerateLookScreen />} />
          <Route path="/chat" element={<ChatScreen />} />
          <Route path="/premium" element={<PremiumScreen />} />
          <Route element={<Layout />}>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/wardrobe" element={<WardrobeScreen />} />
            <Route path="/wardrobe-premium" element={<WardrobePremiumScreen />} />
            <Route path="/wardrobe/item/:id" element={<ItemDetailScreen />} />
            <Route path="/wardrobe/outfits" element={<OutfitsListScreen />} />
            <Route path="/wardrobe/outfits/:id" element={<OutfitDetailScreen />} />
            <Route path="/wardrobe/suitcase" element={<PlaceholderScreen icon={SuitcaseIcon} title="Собрать чемодан" note="Появится в v2" />} />
            <Route path="/stylist" element={<AIStylistScreen />} />
            <Route path="/stylist/capsule" element={<CapsuleWardrobeScreen />} />
            <Route path="/shopping" element={<ShoppingScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/profile/edit" element={<PlaceholderScreen icon={ProfileIcon} title="Редактировать профиль" note="Появится в v2" />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </>
      )}
      </Routes>
    </Suspense>
  );
}

export default App;
