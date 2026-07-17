import { Navigate, Route, Routes } from 'react-router-dom';
import { useTelegram } from './hooks/useTelegram';
import { useOnboarding } from './hooks/useOnboarding';
import { Layout } from './components/ui/Layout';
import { OnboardingScreen } from './components/onboarding/OnboardingScreen';
import { HomeScreen } from './screens/HomeScreen';
import { WardrobeScreen } from './screens/WardrobeScreen';
import { WardrobePremiumScreen } from './screens/WardrobePremiumScreen';
import { StylistScreen } from './screens/StylistScreen';
import { ColorQuizScreen } from './screens/ColorQuizScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { AvatarCreatorScreen } from './screens/AvatarCreatorScreen';
import { AvatarResultScreen } from './screens/AvatarResultScreen';
import { AddItemScreen } from './screens/AddItemScreen';
import { ItemDetailScreen } from './screens/ItemDetailScreen';
import { TryOnScreen } from './screens/TryOnScreen';
import { OutfitsListScreen } from './screens/OutfitsListScreen';
import { OutfitCreatorScreen } from './screens/OutfitCreatorScreen';
import { GenerateLookScreen } from './screens/GenerateLookScreen';
import { OutfitDetailScreen } from './screens/OutfitDetailScreen';
import { ChatScreen } from './screens/ChatScreen';
import { CapsuleWardrobeScreen } from './screens/CapsuleWardrobeScreen';
import { PremiumScreen } from './screens/PremiumScreen';
import { ShoppingScreen } from './screens/ShoppingScreen';
import { PlaceholderScreen } from './components/ui/PlaceholderScreen';
import { SuitcaseIcon, ProfileIcon } from './components/ui/icons';

function App() {
  useTelegram();
  const { seen, markSeen } = useOnboarding();

  return (
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
            <Route path="/stylist" element={<StylistScreen />} />
            <Route path="/stylist/capsule" element={<CapsuleWardrobeScreen />} />
            <Route path="/shopping" element={<ShoppingScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/profile/edit" element={<PlaceholderScreen icon={ProfileIcon} title="Редактировать профиль" note="Появится в v2" />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </>
      )}
    </Routes>
  );
}

export default App;
