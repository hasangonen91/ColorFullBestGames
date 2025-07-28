import { GestureResponderEvent } from 'react-native';

export const useSwipe = (
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
  onSwipeUp: () => void,
  onSwipeDown: () => void
) => {
    let firstTouchX = 0;
    let firstTouchY = 0;
  
    const onTouchStart = (e: GestureResponderEvent) => {
      firstTouchX = e.nativeEvent.pageX;
      firstTouchY = e.nativeEvent.pageY;
      return true;
    };
  
    const onTouchEnd = (e: GestureResponderEvent) => {
      const positionX = e.nativeEvent.pageX;
      const positionY = e.nativeEvent.pageY;
  
      if (Math.abs(positionX - firstTouchX) > Math.abs(positionY - firstTouchY)) {
        if (firstTouchX - positionX > 0) {
          onSwipeLeft();
        }
  
        if (positionX - firstTouchX > 0) {
          onSwipeRight();
        }
      } else if (
        Math.abs(positionX - firstTouchX) < Math.abs(positionY - firstTouchY)
      ) {
        if (firstTouchY - positionY > 0) {
          onSwipeUp();
        }
  
        if (positionY - firstTouchY > 0) {
          onSwipeDown();
        }
      }
    };
    return [onTouchStart, onTouchEnd];
  };