import React, { useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { AnimatePresence, motion, useDragControls, useReducedMotion } from 'framer-motion';
import { FaTimes, FaPaperPlane } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import Avatar from '../common/Avatar';
import CommentItem from './CommentItem';

export default function MobileCommentsSheet({ isOpen, onClose, comments, currentUser, onReply, onSubmit, replyingTo, cancelReply, submitting }) {
    const [localComment, setLocalComment] = useState('');
    const inputRef = useRef(null);
    const sheetRef = useRef(null);
    const dragControls = useDragControls();
    const reducedMotion = useReducedMotion();

    useEffect(() => {
        if (!isOpen) return;
        const previousFocus = document.activeElement;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const timer = setTimeout(() => sheetRef.current?.focus(), 50);
        return () => {
            clearTimeout(timer);
            document.body.style.overflow = previousOverflow;
            if (previousFocus instanceof HTMLElement) previousFocus.focus({ preventScroll: true });
        };
    }, [isOpen]);

    useEffect(() => {
        if (replyingTo) {
            setLocalComment(`@${replyingTo.username} `);
            inputRef.current?.focus();
        }
    }, [replyingTo]);

    const submit = (e) => {
        e.preventDefault();
        if (!localComment.trim() || submitting) return;
        onSubmit(e, localComment);
        setLocalComment('');
    };
    const keyboard = (e) => {
        if (e.key === 'Escape') { e.stopPropagation(); onClose(); }
        if (e.key !== 'Tab') return;
        const controls = Array.from(sheetRef.current?.querySelectorAll('button:not(:disabled), input, a[href]') || []);
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === sheetRef.current)) { e.preventDefault(); last?.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    };

    return ReactDOM.createPortal(<AnimatePresence>
        {isOpen && <motion.div key="comments" className="comments-overlay fixed inset-0 z-[9999] flex flex-col justify-end pointer-events-none">
            <motion.div className="comments-backdrop absolute inset-0 pointer-events-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0 : 0.22 }} onClick={onClose} aria-hidden="true" />
            <motion.section ref={sheetRef} role="dialog" aria-modal="true" aria-labelledby="comments-title" tabIndex={-1} onKeyDown={keyboard}
                className="comments-sheet relative w-full overflow-hidden pointer-events-auto flex flex-col outline-none"
                initial={{ y: reducedMotion ? 0 : '100%' }} animate={{ y: 0 }} exit={{ y: reducedMotion ? 0 : '100%' }}
                transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 360, damping: 36, mass: 0.9 }}
                drag="y" dragControls={dragControls} dragListener={false} dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.7 }}
                onDragEnd={(_, info) => { if (info.offset.y > 90 || info.velocity.y > 650) onClose(); }}>
                <div className="comments-grip shrink-0 border-b border-border pb-3" onPointerDown={e => dragControls.start(e)}>
                    <div className="mx-auto mt-3 mb-2 h-1 w-10 rounded-full bg-muted-foreground/40" />
                    <div className="relative flex h-10 items-center justify-center">
                        <h3 id="comments-title" className="text-base font-semibold">Comments</h3>
                        <Button variant="ghost" size="icon" className="absolute right-3" aria-label="Close comments" title="Close comments" onPointerDown={e => e.stopPropagation()} onClick={onClose}><FaTimes /></Button>
                    </div>
                </div>
                <div className="comments-list flex-1 min-h-0 overflow-y-auto p-4 space-y-6">
                    {comments.length === 0 ? <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground pb-12"><p className="font-medium text-foreground">No comments yet</p><p className="text-sm mt-1">Be the first to start the conversation!</p></div> : comments.map((comment, index) => <CommentItem key={comment._id || index} comment={comment} onReply={onReply} currentUser={currentUser} />)}
                </div>
                <div className="comments-composer p-4 border-t border-border shrink-0">
                    {replyingTo && <div className="flex items-center justify-between text-xs text-muted-foreground mb-2"><span>Replying to <span className="font-semibold text-primary">@{replyingTo.username}</span></span><Button variant="ghost" size="icon" aria-label="Cancel reply" title="Cancel reply" onClick={() => { cancelReply(); setLocalComment(''); }}><FaTimes /></Button></div>}
                    <form onSubmit={submit} className="flex gap-3 items-center">
                        <Avatar src={currentUser?.profilePic} alt="You" size="sm" />
                        <input ref={inputRef} aria-label={replyingTo ? 'Write a reply' : 'Add a comment'} type="text" value={localComment} onChange={e => setLocalComment(e.target.value)} placeholder={replyingTo ? 'Write a reply...' : 'Add a comment...'} className="min-w-0 flex-1 rounded-full bg-muted border border-border px-4 py-3 text-sm focus:outline-none focus:border-primary" />
                        <Button type="submit" variant="ghost" size="icon" disabled={!localComment.trim() || submitting} aria-label="Send comment" title="Send comment" className="text-primary shrink-0"><FaPaperPlane /></Button>
                    </form>
                </div>
            </motion.section>
        </motion.div>}
    </AnimatePresence>, document.body);
}
