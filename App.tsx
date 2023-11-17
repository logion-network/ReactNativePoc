import React, { useCallback, useState } from 'react';
import type { PropsWithChildren } from 'react';
import {
    Button,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    useColorScheme,
    View,
} from 'react-native';
import { LogionClient, KeyringSigner, ClosedLoc, DraftRequest, HashOrContent, MimeType } from '@logion/client';
import { ValidAccountId } from "@logion/node-api";
import { Keyring } from "@polkadot/api";
import { ReactNativeFileUploader, ReactNativeFsFile } from '@logion/client-react-native-fs';
import { Buffer } from 'buffer';
import RNFS from "react-native-fs";

import {
    Colors,
    Header,
} from 'react-native/Libraries/NewAppScreen';

import { LOGION_DIRECTORY, LOGION_RPC, USER_SEED, LEGAL_OFFICER } from './config';

global.Buffer = Buffer;

export default function App() {
    const isDarkMode = useColorScheme() === 'dark';

    const backgroundStyle = {
        backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    };

    const [client, setClient] = useState<LogionClient>();
    const [signer, setSigner] = useState<KeyringSigner>();
    const [accountId, setAccountId] = useState<ValidAccountId>();
    const [identityLoc, setIdentityLoc] = useState<ClosedLoc | null>();
    const [draftCollectionLoc, setDraftCollectionLoc] = useState<DraftRequest | null>();
    const connect = useCallback(async () => {
        if (!client) {
            let createdClient = await LogionClient.create({
                directoryEndpoint: LOGION_DIRECTORY,
                rpcEndpoints: [ LOGION_RPC ],
                buildFileUploader: () => new ReactNativeFileUploader(),
            });
            const keyring = new Keyring({ type: "sr25519" });
            const keypair = keyring.addFromUri(USER_SEED);
            const keyringSigner = new KeyringSigner(keyring);
            setSigner(keyringSigner);
            const accountId = createdClient.logionApi.queries.getValidAccountId(keypair.address, "Polkadot");
            setAccountId(accountId);
            createdClient = createdClient.withCurrentAddress(accountId);
            const authenticatedClient = await createdClient.authenticate([accountId], keyringSigner);
            setClient(authenticatedClient);

            const locsState = await authenticatedClient.locsState();
            const identityLoc = locsState.closedLocs["Identity"].find(loc => loc.owner.address === LEGAL_OFFICER);
            if(identityLoc) {
                setIdentityLoc(identityLoc as ClosedLoc);
            } else {
                setIdentityLoc(null);
            }

            const draftCollectionLoc = locsState.draftRequests["Collection"][0];
            if(draftCollectionLoc) {
                setDraftCollectionLoc(draftCollectionLoc as DraftRequest);
            } else {
                setDraftCollectionLoc(null);
            }
        }
    }, [ client ]);

    const addFile = useCallback(async () => {
        if(draftCollectionLoc) {
            const numberOfFiles = draftCollectionLoc.data().files.length;
            const fileName = `file${numberOfFiles}.txt`;
            const path = `${ RNFS.TemporaryDirectoryPath }/${ fileName }`;
            await RNFS.writeFile(path, `test${numberOfFiles}`);
            let state = await draftCollectionLoc.addFile({
                file: HashOrContent.fromContent(new ReactNativeFsFile(path, fileName, MimeType.from("text/plain"))),
                nature: `Test ${numberOfFiles}`,
            }) as DraftRequest;
            setDraftCollectionLoc(state);
        }
    }, [ signer, draftCollectionLoc ]);

    return (
        <SafeAreaView style={backgroundStyle}>
            <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                backgroundColor={backgroundStyle.backgroundColor}
            />
            <ScrollView
                contentInsetAdjustmentBehavior="automatic"
                style={backgroundStyle}>
                <Header />
                <View
                    style={{
                        backgroundColor: isDarkMode ? Colors.black : Colors.white,
                    }}>
                    {
                        client === undefined &&
                        <Section title="Logion">
                            <Button
                                title="Connect to Logion"
                                onPress={connect}
                            />
                        </Section>
                    }
                    {
                        signer !== undefined && accountId !== undefined &&
                        <Section title="Logion AccountId">
                            {accountId.address}
                        </Section>
                    }
                    {
                        identityLoc !== undefined &&
                        <Section title="Logion ID LOC">
                            ID: {identityLoc?.data().id.toDecimalString() || "None"}
                        </Section>
                    }
                    {
                        draftCollectionLoc !== undefined &&
                        <Section title="Collection LOC">
                            ID: {draftCollectionLoc?.data().id.toDecimalString() || "None"}{"\n"}
                            Files: {draftCollectionLoc?.data().files.length.toString() || "-"}{"\n"}
                            <Button
                                title="Add file"
                                onPress={ addFile }
                            />
                        </Section>
                    }
                    <Section title="Help">
                        <Text>Tap <Text style={{ fontWeight: "bold" }}>R</Text> key twice on your keyboard to refresh.</Text>
                    </Section>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    sectionContainer: {
        marginTop: 32,
        paddingHorizontal: 24,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '600',
    },
    sectionDescription: {
        marginTop: 8,
        fontSize: 18,
        fontWeight: '400',
    },
    highlight: {
        fontWeight: '700',
    },
    label: {
        fontSize: 18,
        fontWeight: '400',
    },
});

type SectionProps = PropsWithChildren<{
    title: string;
}>;

function Section({ children, title }: SectionProps): JSX.Element {
    const isDarkMode = useColorScheme() === 'dark';
    return (
        <View style={styles.sectionContainer}>
            <Text
                style={[
                    styles.sectionTitle,
                    {
                        color: isDarkMode ? Colors.white : Colors.black,
                    },
                ]}>
                {title}
            </Text>
            <Text
                style={[
                    styles.sectionDescription,
                    {
                        color: isDarkMode ? Colors.light : Colors.dark,
                    },
                ]}>
                {children}
            </Text>
        </View>
    );
}
