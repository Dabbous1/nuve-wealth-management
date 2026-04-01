import React, { useCallback, useMemo, forwardRef } from 'react';
import { View, StyleSheet } from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import Colors from '@/constants/colors';
import { useColors } from '@/hooks/useColors';
import { NuveText } from '@/components/NuveText';

interface NuveBottomSheetProps {
  snapPoints: (string | number)[];
  children: React.ReactNode;
  onClose?: () => void;
  title?: string;
  index?: number;
  enableDynamicSizing?: boolean;
}

function HandleIndicator() {
  const C = useColors();
  return (
    <View style={[styles.handleContainer, { backgroundColor: C.white }]}>
      <View style={[styles.handle, { backgroundColor: C.grayLight }]} />
    </View>
  );
}

function renderBackdrop(props: BottomSheetBackdropProps) {
  return (
    <BottomSheetBackdrop
      {...props}
      disappearsOnIndex={-1}
      appearsOnIndex={0}
      style={{ backgroundColor: Colors.midnight }}
      opacity={0.5}
      pressBehavior="close"
    />
  );
}

const NuveBottomSheet = forwardRef<BottomSheet, NuveBottomSheetProps>(
  ({ snapPoints, children, onClose, title, index = -1, enableDynamicSizing }, ref) => {
    const C = useColors();
    const handleSheetChanges = useCallback(
      (i: number) => {
        if (i === -1 && onClose) {
          onClose();
        }
      },
      [onClose],
    );

    return (
      <BottomSheet
        ref={ref}
        index={index}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose
        enableDynamicSizing={enableDynamicSizing}
        handleComponent={HandleIndicator}
        backdropComponent={renderBackdrop}
        backgroundStyle={[styles.background, { backgroundColor: C.white }]}
      >
        <BottomSheetView style={styles.content}>
          {title ? (
            <View style={styles.titleContainer}>
              <NuveText variant="h3" family="display">
                {title}
              </NuveText>
            </View>
          ) : null}
          {children}
        </BottomSheetView>
      </BottomSheet>
    );
  },
);

NuveBottomSheet.displayName = 'NuveBottomSheet';

const NuveBottomSheetModal = forwardRef<BottomSheetModal, NuveBottomSheetProps>(
  ({ snapPoints, children, onClose, title, enableDynamicSizing }, ref) => {
    const C = useColors();
    const handleDismiss = useCallback(() => {
      if (onClose) {
        onClose();
      }
    }, [onClose]);

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        onDismiss={handleDismiss}
        enablePanDownToClose
        enableDynamicSizing={enableDynamicSizing}
        handleComponent={HandleIndicator}
        backdropComponent={renderBackdrop}
        backgroundStyle={[styles.background, { backgroundColor: C.white }]}
      >
        <BottomSheetView style={styles.content}>
          {title ? (
            <View style={styles.titleContainer}>
              <NuveText variant="h3" family="display">
                {title}
              </NuveText>
            </View>
          ) : null}
          {children}
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

NuveBottomSheetModal.displayName = 'NuveBottomSheetModal';

const styles = StyleSheet.create({
  handleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  background: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  titleContainer: {
    marginBottom: 12,
  },
});

export { NuveBottomSheet, NuveBottomSheetModal };
export default NuveBottomSheet;
