package com.nguyencong.fieldmate.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.nguyencong.fieldmate.dto.request.SportTypeRequest;
import com.nguyencong.fieldmate.dto.response.SportTypeResponse;
import com.nguyencong.fieldmate.entity.SportType;
import com.nguyencong.fieldmate.mapper.SportTypeMapper;
import com.nguyencong.fieldmate.repository.SportTypeResponsitory;
import com.nguyencong.fieldmate.service.SportTypeService;

@Service
public class SportTypeServiceImpl implements SportTypeService {

    @Autowired
    private SportTypeResponsitory sportTypeRepository;

    @Override
    public List<SportTypeResponse> getAllSportTypes() {
        return sportTypeRepository.findAll()
                .stream()
                .map(SportTypeMapper::toResponse)
                .toList();
    }

    @Override
    public SportTypeResponse createSportType(SportTypeRequest request) {
        String name = request.getName().trim();

        if (sportTypeRepository.existsByNameIgnoreCase(name)) {
            throw new RuntimeException("Loại thể thao đã tồn tại");
        }

        SportType sportType = SportTypeMapper.toEntity(request);
        SportType savedSportType = sportTypeRepository.save(sportType);

        return SportTypeMapper.toResponse(savedSportType);
    }

    @Override
    public SportTypeResponse updateSportType(Long id, SportTypeRequest request) {
        SportType sportType = sportTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy loại thể thao"));

        String name = request.getName().trim();

        if (sportTypeRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new RuntimeException("Loại thể thao đã tồn tại");
        }

        SportTypeMapper.updateEntity(sportType, request);

        return SportTypeMapper.toResponse(sportTypeRepository.save(sportType));
    }

    @Override
    public void deleteSportType(Long id) {
        SportType sportType = sportTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy loại thể thao này"));

        sportTypeRepository.delete(sportType);
    }
}
