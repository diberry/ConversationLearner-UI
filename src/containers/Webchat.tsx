import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { toggleTrainDialog, addMessageToTeachConversationStack, addMessageToChatConversationStack } from '../actions/displayActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State, TrainDialogState } from '../types';
import { generateGUID } from '../util';
import * as BotChat from 'blis-webchat'
import { Chat } from 'blis-webchat'
import { UserInput } from 'blis-models'
import { BehaviorSubject } from 'rxjs';
import { runExtractorAsync } from '../actions/teachActions';
import { setTrainDialogView } from '../actions/displayActions';
import { Activity } from 'botframework-directlinejs';

class Webchat extends React.Component<Props, any> {
    private behaviorSubject : BehaviorSubject<any> = null;
    private chatProps : BotChat.ChatProps = null;

    constructor(p: any) {
        super(p);
        this.behaviorSubject = null;
        this.selectedActivity$ = this.selectedActivity$.bind(this)
    }

    selectedActivity$() : BehaviorSubject<any>
    { 
        if (!this.behaviorSubject) {
            this.behaviorSubject = new BehaviorSubject<any>({});
            this.behaviorSubject.subscribe((value) => {
                if (value.activity) {
                    // TODO: support for multiple scorersteps
                    this.props.setTrainDialogView(value.activity.id,0);
                }
            })
        } 
        return this.behaviorSubject;
    }

    GetChatProps() : BotChat.ChatProps {
        if (!this.chatProps)
        {
            const dl = new BotChat.DirectLine({
                secret: 'secret', //params['s'],
                token: 'token', //params['t'],
                domain: "http://localhost:3000/directline", //params['domain'],
                webSocket: false // defaults to true,
            });
    
            const _dl = {
                ...dl,
                postActivity: (activity: any) => {
                    if (activity.type = "message")
                    {
                        if (this.props.sessionType === 'teach') {
                            this.props.addMessageToTeachConversationStack(activity.text)
    
                            let userInput = new UserInput({ text: activity.text});
                            let appId: string = this.props.apps.current.appId;
                            let teachId: string = this.props.teachSessions.current.teachId;
                            this.props.runExtractor(this.props.user.key, appId, teachId, userInput);
    
                        } else {
                            this.props.addMessageToChatConversationStack(activity)
                        }
                    }
                    return dl.postActivity(activity)
                },
            } as BotChat.DirectLine;
    
            this.chatProps = {
                botConnection: _dl,
                formatOptions: {
                    showHeader: false
                },
                user: { name: this.props.user.name, id: this.props.user.id },
                bot: { name: "BlisTrainer", id: "BlisTrainer" },
                resize: 'detect'
            }
            // If viewing history, add history and listener
            if (this.props.history) {
                this.chatProps = {...this.chatProps, history: this.props.history,  selectedActivity: this.selectedActivity$() as any};
            }
        }
        return this.chatProps;
    }
    render() {
        let chatProps = this.GetChatProps();
        return (
            <div id="botchat" className="webchatwindow wc-app">
                <Chat {...chatProps} />
            </div>
        )
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        toggleTrainDialog: toggleTrainDialog,
        setTrainDialogView: setTrainDialogView,
        addMessageToTeachConversationStack: addMessageToTeachConversationStack,
        addMessageToChatConversationStack: addMessageToChatConversationStack,
        runExtractor: runExtractorAsync
    }, dispatch);
}
const mapStateToProps = (state: State, ownProps: any) => {
    return {
        teachSessions: state.teachSessions,
        chatSessions: state.chatSessions,
        user: state.user,
        apps: state.apps
    }
}

interface ReceivedProps {
    sessionType: string,
    history: Activity[]
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps;

export default connect(mapStateToProps, mapDispatchToProps)(Webchat as React.ComponentClass<any>);