import * as React from 'react';

import { StyleSheet, View, Text, Button } from 'react-native';
import { Buffer } from 'buffer';
import MidiPlayback from 'react-native-midi-playback';
import * as RNFS from 'react-native-fs';
import { Midi } from '@tonejs/midi';
import * as song from './song.json';

export default function App() {
  React.useEffect(() => {
    console.log(song.tracks[0].notes)
    let midi = new Midi();
    midi.fromJSON(song);
    // on iOS this path has a slash at the end, on Android it does not
    // check to see if we need to add a slash before our file name
    let slash =
      RNFS.TemporaryDirectoryPath[RNFS.TemporaryDirectoryPath.length - 1] ===
      '/'
        ? ''
        : '/';
    let path = RNFS.TemporaryDirectoryPath + slash + 'song.mid';
    RNFS.exists(path).then((exists) => {
      console.log('exists: ', exists);
      if (exists) {
        RNFS.unlink(path).then(() => {
          writeFile(midi, path);
        });
      } else {
        writeFile(midi, path);
      }
    });
  }, []);

  const writeFile = (midi: Midi, path: string) => {
    RNFS.write(
      path,
      Buffer.from(midi.toArray()).toString('binary'),
      undefined,
      'ascii'
    )
      .then(() => {
        console.log('Successfully wrote MIDI file to ' + path);
        MidiPlayback.setPlaybackFile(path);
      })
      .then(() => {
        MidiPlayback.play();
        console.log(MidiPlayback.isPlaying());
      })
      .catch((err) => {
        console.log(err.message);
      });
  }

  const playPause = () => {
    if (MidiPlayback.isPlaying()) {
      MidiPlayback.stop();
    } else {
      let slash =
        RNFS.TemporaryDirectoryPath[RNFS.TemporaryDirectoryPath.length - 1] ===
        '/'
          ? ''
          : '/';
      let path = RNFS.TemporaryDirectoryPath + slash + 'song.mid';
      MidiPlayback.setPlaybackFile(path);
      MidiPlayback.play();
    }
  };

  return (
    <View style={styles.container}>
      <Text>Running</Text>
      <Button title={'play/pause'} onPress={playPause}></Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
