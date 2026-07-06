import { Deck } from './components/Deck';
import { slides } from './content/slides';

export default function App() {
  return <Deck slides={slides} />;
}
