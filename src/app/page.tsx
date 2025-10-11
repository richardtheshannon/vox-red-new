import TopIconBar from '@/components/TopIconBar';
import LeftIconBar from '@/components/LeftIconBar';
import RightIconBar from '@/components/RightIconBar';
import BottomIconBar from '@/components/BottomIconBar';
import MainContent from '@/components/MainContent';

export default function Home() {
  return (
    <>
      <TopIconBar />
      <LeftIconBar />
      <RightIconBar />
      <BottomIconBar />
      <MainContent />
    </>
  );
}