package com.recep.encoach.event;

/** Yeni okuma metni kaydedildiğinde yayınlanır; indexleme commit'ten sonra bu event ile tetiklenir. */
public record PassageCreatedEvent(Long passageId, String title, String content) {
}
