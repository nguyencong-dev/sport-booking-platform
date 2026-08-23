package com.nguyencong.fieldmate.utils;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

public final class PaginationUtils {

    private static final int PAGE_SIZE = 12;

    private PaginationUtils() {
    }

    public static Pageable createPageable(int page) {

        int safePage = Math.max(page, 0);

        return PageRequest.of(safePage, PAGE_SIZE, Sort.by(Sort.Direction.DESC, "id"));
    }

    public static Pageable createUnsortedPageable(int page) {

        int safePage = Math.max(page, 0);

        return PageRequest.of(safePage, PAGE_SIZE);
    }
}
