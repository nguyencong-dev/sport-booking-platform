package com.nguyencong.fieldmate.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nguyencong.fieldmate.dto.request.MomoPaymentAccountRequest;
import com.nguyencong.fieldmate.dto.request.PaymentAccountStatusRequest;
import com.nguyencong.fieldmate.dto.request.VnPayPaymentAccountRequest;
import com.nguyencong.fieldmate.dto.response.PaymentAccountResponse;
import com.nguyencong.fieldmate.entity.MomoCredential;
import com.nguyencong.fieldmate.entity.OwnerPaymentAccount;
import com.nguyencong.fieldmate.entity.User;
import com.nguyencong.fieldmate.entity.VnPayCredential;
import com.nguyencong.fieldmate.entity.enums.PaymentAccountStatus;
import com.nguyencong.fieldmate.entity.enums.PaymentProvider;
import com.nguyencong.fieldmate.entity.enums.Role;
import com.nguyencong.fieldmate.exception.BadRequestException;
import com.nguyencong.fieldmate.exception.BusinessRuleViolationException;
import com.nguyencong.fieldmate.exception.DuplicateResourceException;
import com.nguyencong.fieldmate.exception.ResourceNotFoundException;
import com.nguyencong.fieldmate.mapper.OwnerPaymentAccountMapper;
import com.nguyencong.fieldmate.repository.MomoCredentialRepository;
import com.nguyencong.fieldmate.repository.OwnerPaymentAccountRepository;
import com.nguyencong.fieldmate.repository.VnPayCredentialRepository;
import com.nguyencong.fieldmate.security.CurrentUserProvider;
import com.nguyencong.fieldmate.service.CredentialEncryptionService;
import com.nguyencong.fieldmate.service.OwnerPaymentAccountService;

@Service
public class OwnerPaymentAccountServiceImpl implements OwnerPaymentAccountService {

    @Autowired
    private OwnerPaymentAccountRepository paymentAccountRepository;

    @Autowired
    private MomoCredentialRepository momoCredentialRepository;

    @Autowired
    private VnPayCredentialRepository vnPayCredentialRepository;

    @Autowired
    private CurrentUserProvider currentUserProvider;

    @Autowired
    private CredentialEncryptionService credentialEncryptionService;

    @Override
    @Transactional
    public PaymentAccountResponse createMomoAccount(MomoPaymentAccountRequest request) {

        User currentOwner = currentUserProvider.getCurrentUser();

        boolean momoAccountExists = paymentAccountRepository.existsByOwner_IdAndProvider(currentOwner.getId(),
                PaymentProvider.MOMO);

        if (momoAccountExists) {
            throw new DuplicateResourceException("Bạn đã có tài khoản thanh toán MoMo");
        }

        String partnerCode = request.getPartnerCode().trim();

        boolean partnerCodeExists = momoCredentialRepository.existsByPartnerCode(partnerCode);

        if (partnerCodeExists) {
            throw new DuplicateResourceException("Partner code MoMo đã được sử dụng");
        }

        OwnerPaymentAccount paymentAccount = OwnerPaymentAccountMapper.toMomoAccount(currentOwner);

        OwnerPaymentAccount savedAccount = paymentAccountRepository.save(paymentAccount);

        String encryptedAccessKey = credentialEncryptionService.encrypt(request.getAccessKey().trim());

        String encryptedSecretKey = credentialEncryptionService.encrypt(request.getSecretKey());

        MomoCredential momoCredential = OwnerPaymentAccountMapper.toMomoCredential(request, savedAccount,
                encryptedAccessKey, encryptedSecretKey);

        MomoCredential savedCredential = momoCredentialRepository.save(momoCredential);
        return OwnerPaymentAccountMapper.toResponse(savedAccount, savedCredential);
    }

    @Override
    @Transactional
    public PaymentAccountResponse createVnPayAccount(VnPayPaymentAccountRequest request) {

        User currentOwner = currentUserProvider.getCurrentUser();

        boolean accountExists = paymentAccountRepository.existsByOwner_IdAndProvider(currentOwner.getId(),
                PaymentProvider.VNPAY);

        if (accountExists) {
            throw new DuplicateResourceException("Bạn đã có tài khoản thanh toán VNPay");
        }

        String tmnCode = request.getTmnCode().trim();

        if (vnPayCredentialRepository.existsByTmnCode(tmnCode)) {
            throw new DuplicateResourceException("TmnCode VNPay đã được sử dụng");
        }

        OwnerPaymentAccount paymentAccount = OwnerPaymentAccountMapper.toVnPayAccount(currentOwner);

        OwnerPaymentAccount savedAccount = paymentAccountRepository.save(paymentAccount);

        String encryptedHashSecret = credentialEncryptionService.encrypt(request.getHashSecret().trim());

        VnPayCredential credential = OwnerPaymentAccountMapper.toVnPayCredential(request, savedAccount,
                encryptedHashSecret);

        VnPayCredential savedCredential = vnPayCredentialRepository.save(credential);

        return OwnerPaymentAccountMapper.toResponse(savedAccount, savedCredential);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentAccountResponse> getCurrentOwnerPaymentAccounts() {

        User currentOwner = currentUserProvider.getCurrentUser();

        List<OwnerPaymentAccount> accounts = paymentAccountRepository
                .findByOwner_IdOrderByCreatedAtDesc(currentOwner.getId());

        return accounts.stream()
                .map(account -> switch (account.getProvider()) {

                    case MOMO -> {

                        MomoCredential credential = momoCredentialRepository.findByPaymentAccount_Id(account.getId())
                                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy credential MoMo"));

                        yield OwnerPaymentAccountMapper.toResponse(account, credential);
                    }

                    case VNPAY -> {

                        VnPayCredential credential = vnPayCredentialRepository.findByPaymentAccount_Id(account.getId())
                                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy credential VNPay"));

                        yield OwnerPaymentAccountMapper.toResponse(account, credential);
                    }
                })
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentAccountResponse getPaymentAccountById(Long id) {

        User currentUser = currentUserProvider.getCurrentUser();

        OwnerPaymentAccount account = paymentAccountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản thanh toán"));

        boolean isAdmin = currentUser.getRole() == Role.ADMIN;

        boolean isOwner = account.getOwner().getId().equals(currentUser.getId());

        if (!isAdmin && !isOwner) {
            throw new AccessDeniedException("Bạn không có quyền xem tài khoản thanh toán này");
        }

        return switch (account.getProvider()) {
            case MOMO -> {
                MomoCredential credential = momoCredentialRepository.findByPaymentAccount_Id(account.getId())
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy credential MoMo"));

                yield OwnerPaymentAccountMapper.toResponse(account, credential);
            }

            case VNPAY -> {
                VnPayCredential credential = vnPayCredentialRepository.findByPaymentAccount_Id(account.getId())
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy credential VNPay"));

                yield OwnerPaymentAccountMapper.toResponse(account, credential);
            }
        };
    }

    @Override
    @Transactional
    public PaymentAccountResponse updateMomoAccount(Long id, MomoPaymentAccountRequest request) {

        User currentOwner = currentUserProvider.getCurrentUser();

        OwnerPaymentAccount account = paymentAccountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản thanh toán"));

        if (!account.getOwner().getId().equals(currentOwner.getId())) {
            throw new AccessDeniedException("Bạn không có quyền cập nhật tài khoản này");
        }

        if (account.getProvider() != PaymentProvider.MOMO) {
            throw new BadRequestException("Tài khoản thanh toán này không phải MoMo");
        }

        String partnerCode = request.getPartnerCode().trim();

        boolean partnerCodeExists = momoCredentialRepository.existsByPartnerCodeAndPaymentAccount_IdNot(partnerCode,
                account.getId());

        if (partnerCodeExists) {
            throw new DuplicateResourceException("Partner code MoMo đã được sử dụng");
        }

        MomoCredential credential = momoCredentialRepository
                .findByPaymentAccount_Id(account.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy credential MoMo"));

        String encryptedAccessKey = credentialEncryptionService.encrypt(request.getAccessKey().trim());

        String encryptedSecretKey = credentialEncryptionService.encrypt(request.getSecretKey().trim());

        OwnerPaymentAccountMapper.updateMomoCredential(credential, request, encryptedAccessKey, encryptedSecretKey);

        account.setStatus(PaymentAccountStatus.PENDING);

        momoCredentialRepository.save(credential);
        paymentAccountRepository.save(account);

        return OwnerPaymentAccountMapper.toResponse(account, credential);
    }

    @Override
    @Transactional
    public PaymentAccountResponse updateVnPayAccount(Long id, VnPayPaymentAccountRequest request) {

        User currentOwner = currentUserProvider.getCurrentUser();

        OwnerPaymentAccount account = paymentAccountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản thanh toán"));

        if (!account.getOwner().getId().equals(currentOwner.getId())) {
            throw new AccessDeniedException("Bạn không có quyền cập nhật tài khoản này");
        }

        if (account.getProvider() != PaymentProvider.VNPAY) {
            throw new BadRequestException("Tài khoản thanh toán này không phải VNPay");
        }

        String tmnCode = request.getTmnCode().trim();

        boolean tmnCodeExists = vnPayCredentialRepository.existsByTmnCodeAndPaymentAccount_IdNot(tmnCode,
                account.getId());

        if (tmnCodeExists) {
            throw new DuplicateResourceException("TmnCode VNPay đã được sử dụng");
        }

        VnPayCredential credential = vnPayCredentialRepository.findByPaymentAccount_Id(account.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy credential VNPay"));

        String encryptedHashSecret = credentialEncryptionService.encrypt(request.getHashSecret().trim());

        OwnerPaymentAccountMapper.updateVnPayCredential(credential, request, encryptedHashSecret);

        account.setStatus(PaymentAccountStatus.PENDING);

        vnPayCredentialRepository.save(credential);
        paymentAccountRepository.save(account);

        return OwnerPaymentAccountMapper.toResponse(account, credential);
    }

    @Override
    @Transactional
    public PaymentAccountResponse deactivatePaymentAccount(Long id) {

        User currentOwner = currentUserProvider.getCurrentUser();

        OwnerPaymentAccount account = paymentAccountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản thanh toán"));

        if (!account.getOwner().getId().equals(currentOwner.getId())) {
            throw new AccessDeniedException("Bạn không có quyền tắt tài khoản thanh toán này");
        }

        if (account.getStatus() == PaymentAccountStatus.SUSPENDED) {
            throw new AccessDeniedException("Tài khoản thanh toán đang bị quản trị viên đình chỉ");
        }

        account.setStatus(PaymentAccountStatus.INACTIVE);

        OwnerPaymentAccount savedAccount = paymentAccountRepository.save(account);

        return switch (savedAccount.getProvider()) {
            case MOMO -> {
                MomoCredential credential = momoCredentialRepository.findByPaymentAccount_Id(savedAccount.getId())
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy credential MoMo"));

                yield OwnerPaymentAccountMapper.toResponse(savedAccount, credential);
            }

            case VNPAY -> {
                VnPayCredential credential = vnPayCredentialRepository.findByPaymentAccount_Id(savedAccount.getId())
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy credential VNPay"));

                yield OwnerPaymentAccountMapper.toResponse(savedAccount, credential);
            }
        };
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentAccountResponse> getAllPaymentAccounts(
            PaymentAccountStatus status) {

        List<OwnerPaymentAccount> accounts;

        if (status != null) {
            accounts = paymentAccountRepository.findByStatusOrderByCreatedAtDesc(status);
        } else {
            accounts = paymentAccountRepository.findAllByOrderByCreatedAtDesc();
        }

        return accounts.stream()
                .map(account -> switch (account.getProvider()) {
                    case MOMO -> {
                        MomoCredential credential = momoCredentialRepository.findByPaymentAccount_Id(account.getId())
                                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy credential MoMo"));

                        yield OwnerPaymentAccountMapper.toResponse(account, credential);
                    }

                    case VNPAY -> {
                        VnPayCredential credential = vnPayCredentialRepository
                                .findByPaymentAccount_Id(account.getId())
                                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy credential VNPay"));

                        yield OwnerPaymentAccountMapper.toResponse(account, credential);
                    }
                }).toList();
    }

    @Override
    @Transactional
    public PaymentAccountResponse updatePaymentAccountStatus(Long id, PaymentAccountStatusRequest request) {

        OwnerPaymentAccount account = paymentAccountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản thanh toán"));

        account.setStatus(request.getStatus());

        OwnerPaymentAccount savedAccount = paymentAccountRepository.save(account);

        return switch (savedAccount.getProvider()) {
            case MOMO -> {
                MomoCredential credential = momoCredentialRepository.findByPaymentAccount_Id(savedAccount.getId())
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy credential MoMo"));

                yield OwnerPaymentAccountMapper.toResponse(savedAccount, credential);
            }

            case VNPAY -> {
                VnPayCredential credential = vnPayCredentialRepository.findByPaymentAccount_Id(savedAccount.getId())
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy credential VNPay"));

                yield OwnerPaymentAccountMapper.toResponse(savedAccount, credential);
            }
        };
    }

    @Override
    @Transactional
    public PaymentAccountResponse activatePaymentAccount(Long id) {

        User currentOwner = currentUserProvider.getCurrentUser();

        OwnerPaymentAccount account = paymentAccountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản thanh toán"));

        if (!account.getOwner().getId().equals(currentOwner.getId())) {
            throw new AccessDeniedException("Bạn không có quyền bật tài khoản thanh toán này");
        }

        if (account.getStatus() == PaymentAccountStatus.SUSPENDED) {
            throw new AccessDeniedException("Tài khoản đang bị quản trị viên đình chỉ");
        }

        if (account.getStatus() != PaymentAccountStatus.INACTIVE) {
            throw new BusinessRuleViolationException("Chỉ tài khoản INACTIVE mới có thể được bật lại");
        }

        account.setStatus(PaymentAccountStatus.ACTIVE);

        OwnerPaymentAccount savedAccount = paymentAccountRepository.save(account);

        return switch (savedAccount.getProvider()) {
            case MOMO -> {
                MomoCredential credential = momoCredentialRepository.findByPaymentAccount_Id(savedAccount.getId())
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy credential MoMo"));

                yield OwnerPaymentAccountMapper.toResponse(savedAccount, credential);
            }

            case VNPAY -> {
                VnPayCredential credential = vnPayCredentialRepository.findByPaymentAccount_Id(savedAccount.getId())
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy credential VNPay"));

                yield OwnerPaymentAccountMapper.toResponse(savedAccount, credential);
            }
        };
    }
}